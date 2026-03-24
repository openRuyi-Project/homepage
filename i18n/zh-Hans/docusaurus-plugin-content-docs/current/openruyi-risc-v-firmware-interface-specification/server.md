---
id: server-spec
title: 标准服务器平台固件接口规范
description: 这个文档讲述了标准服务器平台固件接口规范。
slug: /guide/openruyi-risc-v-firmware-interface-specification/server-spec
---


# openRuyi RISC-V 固件接口规范 —— 标准服务器平台固件接口规范

## 1. 前言

RISC-V 开放指令集架构的快速发展，openRuyi 团队正在推动更多实际硬件平台进入可运行通用操作系统的阶段。openRuyi 项目致力于构建一个能够在多种 RISC-V 处理器和 SoC 上运行的操作系统，其核心设计目标之一是：尽可能减少针对特定硬件平台或特定固件实现的定制化修改。

为此，《openRuyi RISC-V 固件接口规范》定义了如意操作系统对底层固件（包括引导加载程序、SBI、 UEFI、ACPI、Device Tree等）所提出的最低一致性要求和行为预期。只有当厂商提供的固件满足本规范中描述的接口约定、必选功能、数据结构格式时，如意操作系统才能够在相应硬件上实现相对直接、无需大量平台特定补丁的启动与运行。

本规范的目标是：
1. 为硬件厂商和固件开发者提供明确的“如意操作系统兼容固件”开发指引
2. 作为如意操作系统判断目标平台是否满足基本运行条件的技术依据
3. 降低如意操作系统在不同 RISC-V 硬件间移植和适配的工程成本与维护负担

当前版本的规范仍处于早期制定阶段，部分细节仍在根据实际适配经验进行验证和完善，后续版本可能会对某些要求进行细化、调整或增加新的必选/可选项。但其根本目标保持不变：通过固件侧的标准化配合，让如意操作系统能够在尽可能多的符合规范的 RISC-V 平台上“开箱即用”或接近“开箱即用”。

本规范在起草过程中参考了 RISC-V Boot and Runtime Services (BRS)[^1]，并结合如意操作系统自身的内核架构特点进行了取舍与适配。

如意操作系统开发团队期望并欢迎硬件厂商、固件实现者及社区开发者根据本规范进行实现、测试与反馈。任何在适配过程中发现的接口不清晰、难以满足、行为冲突或实际硬件限制导致的困难，都将是后续版本优化的重要输入。

## 2. 术语与定于

本规范所使用的术语定义如下：
1. 固件（firmware）：写入 ROM、EPROM 等非易失存储器中的程序，负责初始化控制硬件也可以在系统启动后提供一些运行时的服务
2. SBI（Supervisor Binary Interface）：运行于M模式为Supervisor提供的运行环境（Supervisor Execution Environment）
3. DT（Device Tree）：设备树用于描述设备信息，以及给程序传递信
4. UEFI（Unified Extensible Firmware Interface Specification）：统一可扩展的固件接口规范
5. ACPI（Advanced Configuration and Power Interface Specification）：高级配置和电源接口规范
6. SMBIOS（System Management BIOS (SMBIOS) Reference Specification）：系统管理 BIOS，它主要为操作系统提供硬件信息
7. BRS（RISC-V Boot and Runtime Services Specification）：RISC-V 启动和运行时服务规范
8. SoC（System on Chip）：片上系统，一块芯片中封装了处理器以及一些片上外设

## 3. 处理器

运行操作系统的 hart 必须需要兼容RVA20S64[^11]，建议兼容RVA23S64[^11]。

在 UEFI 退出启动服务之前，需要完成所有的固件内部操作。并把次要 hart 置于离线状态。

### 3.1 ACPI

必须实现处理器属性表 PPTT，即使系统具有简单的 hart 拓扑

hart 的设备对象必须定义在系统总线（_SB）的命名空间下，而不是被启用的处理器命（_PR）名空间

### 3.2 SMBIOS

#### 3.2.1 Type 04 处理器信息

用于记录处理器信息，处理器是指物理封装中的一组 hart 集合。通常处理器指的就是 SoC。

对于 RISC-V ，处理器 ID 字段包含两个 DWORD 格式的值，用于描述整个物理处理器封装的厂商和版本。对于某些实现，这也称为 SoC ID。第一个 DWORD（偏移量 08h-0Bh）是厂商的 JEP-106 代码，其中位 6:0 为不含奇偶校验的 ID，位 31:7 表示延续码的数量。第二个 DWORD（偏移量 0Ch-0Fh）反映厂商特定的部件版本信息。

#### 3.2.2 Type 44 处理器特定数据

对于每一个 hart 都需要提供一个 Type 44的处理器描述，处理器特定数据结构的字段遵循SMBIOS标准[^6] (第 7.45.1 节) 的定义。

该结构仅对声明为 RISC-V 处理器时有效（类型07h）。结构描述如下表

|偏移量  | 长度	| 描述  |
|-------|-------|-------|
| 00h	| WORD	| 版本信息，只有版本为0100h时结构才符合当前描述 |
| 02h	| QWORD	| HART ID   |
| 0Ah	| QWORD	| 厂商ID    |
| 12h	| QWORD	| hart 的基础微架构。如果为0表示未实现。和厂商 ID 一起唯一标识 hart 的架构类型  |
| 1Ah	| QWORD	| 处理器实现的版本的唯一编码    |

版本信息，一个 WORD 分为高低八位，高八位为大版本号，低八位为小版本号，当前版本为1.0对应0100h。如果添加新字段并且兼容，就增加小版本号。如果发生不兼容的变化就增加大版本号。

Machine Vendor ID、Machine Architecture ID 和 Machine Implementation ID 字段通常分别反映 mvendorid、marchid 和 mimpid CSR。

### 3.3 能效相关

处理器空闲状态必须通过 _LPI 描述

支持操作系统直接控制核心性能的系统应该通过 CPPC 暴露这些功能

## 4. 内存映射

默认内存空间的属性为 EFI_MEMORY_WB

固件必须使用直接映射（虚拟地址等于物理地址）分配虚拟内存，必须支持 EFI_MEMORY_ATTRIBUTE_PROTOCOL 协议

SMBIOS 数据使用 EfiRuntimeServicesData 类型内存

## 5. SBI

RISC-V Supervisor Binary Interface Specification (SBI)[^5]定义了监督模式与机器权模式之间的接口。本章节主要描述运行如意操作系统对 SBI 的要求。

以下是必须符合的要求
1. 必须符合v2.0或者更高版本
2. 必须实现 HSM 扩展，此扩张用于启动、停止、暂停、查询核心的状态

以下要求在缺少某些 ISA 扩展时必须实现
1. 如果核心没有stimecmp/vstimecmp 控制状态寄存器（Sstc），SBI必须实现Timer 扩展(TIME)
2. 如果核心不支持Incoming MSI Controller（IMSIC）[^12]，必须实现S-Mode IPI 扩展 (SPI)
3. 如果核心不支持Incoming MSI Controller（IMSIC）[^12]，必须实现RFENCE 扩展 (RFNC)
4. 如果不存在与计数器委托相关的 S-Mode ISA 扩展（Sscsrind和Ssccfg ），则必须实现性能监视扩展 (PMU)。
5. 如果 ACPI SPCR[^8] 表引用接口类型 0x15，则必须实现调试控制台扩展 (DBCN)扩展。

## 6. Device Tree

Device Tree[^4]的版本是v0.3或者更新。传递给操作系统的 Device Tree 不应该包含任何硬件信息。此时的设备树可用于参数传递。

## 7. UEFI

统一可扩展固件接口规范（UEFI）[^2]描述了操作系统与监督模式固件之间的接口。UEFI的版本应该是2.1.0或者更新并且满足EBBR[^7]的需求。系统固件的不同部分可能针对特定的特权级别。相比之下，UEFI 驱动程序、OS loader 和预引导应用程序需要在监管模式（VS-Mode 或 HS-Mode）下运行，因为它们是符合 UEFI 的可执行映像。

作为实现选择，UEFI 固件实现可以在 M-Mode 开始执行。然而，它必须在初始化 UEFI 驱动程序和应用程序的引导和运行时服务时切换到监管模式。

1. 必须实现64 UEFI 固件
2. 必须满足第三方 UEFI 证书颁发机构对 UEFI 内存缓存措施的要求
3. 实现可符合 UEFI 平台初始化规范[^10]
4. 所有核心应该在 EFI_EVENT_GROUP_READY_TO_BOOT 事件完成之前完成固件相关的内部操作，并把次要核心置于离线状态
5. 必须在UEFI系统表中声明 EFI_CONFORMANCE_PROFILES_UEFI_SPEC_GUID，表示 UEFI 固件符合 UEFI 规范的 required 部分
6. 必须在UEFI系统表中声明 EFI_CONFORMANCE_PROFILE_BRS_1_0_SPEC_GUID，表示 UEFI 固件符合 riscv-brs 1.0的要求

### 7.1 IO要求

如果有 PCIe[^9] 的系统必须初始化所有的 PCIe 根复合体，并为所有的设备分配资源包含热插拔的 Switch。就算不从 PCIe 设备启动也是如此。

实现 EFI_GRAPHICS_OUTPUT_PROTOCOL 协议，应该将帧缓冲区设置为直接可访问。即 EFI_GRAPHICS_PIXEL_FORMAT 不是 PixelBltOnly，并且 FrameBufferBase 被报告为有效的 hart 内存映射 I/O 地址。

### 7.2 运行时服务

以下是对 UEFI 对运行时服务的要求：
1. 没有 RTC 但具有等效时间源的系统需要满足以下要求：
    - GetTime() 必须实现
    - SetTime() 必须返回 EFI_UNSUPPORTED，并在 EFI_RT_PROPERTIES_TABLE 中适当描述
2. 如果在操作系统管理的总线上有RTC系统必须满足以下要求：
    - 在引导服务退出后，GetTime() 和 SetTime() 必须返回 EFI_UNSUPPORTED。退出之前使用和操作系统相同的时钟源
    - GetTime() 和 SetTime() 必须在 EFI_RT_PROPERTIES_TABLE 中适当描述。
3. ResetSystem 运行时服务必须实现。操作系统调用此服务可以处理 UpdateCapsule 和某些持久化非易失的变量
4. 非易失变量应该在 ResetSystem 后保持不变
5. 运行时服务必须能够在不借助 OS 的情况下直接更新 UEFI 变量

### 7.3 安全要求

下面是 UEFI 安全相关的要求：
1. 实现 TPM 的系统必须实现 TCG EFI Protocol Specification[^14]
2. 支持安全引导的系统必须最少有 128KiB 的非易失存储，用于储存 UEFI 变量
3. 支持安全引导的系统 UEFI 变量的最大限制应该大于等于 64KiB
4. 对于具有 UEFI 安全引导的系统，db 签名数据库变量 (EFI_IMAGE_SECURITY_DATABASE) 必须使用 EFI_VARIABLE_TIME_BASED_AUTHENTICATED_WRITE_ACCESS 创建，以防止回滚攻击。
5. 对于具有 UEFI 安全引导的系统，dbx 签名数据库变量 (EFI_IMAGE_SECURITY_DATABASE1) 必须使用 EFI_VARIABLE_TIME_BASED_AUTHENTICATED_WRITE_ACCESS 创建，以防止回滚攻击。

### 7.4 固件更新

UEFI 提供标准化的固件交付方法，它将更新数据（代码或配置）与元数据封装在一个“胶囊”（Capsule）二进制对象中。下面是固件更新的要求：
1. 具有固件更新的系统必须通过 UpdateCapsule 运行时服务或者通过 Mass Storage Device 上的文件交付
2. 通过 UpdateCapsule 运行时服务更新系统必须接受 Firmware Management Protocol Data Capsule Structure 格式
3. 通过 UpdateCapsule 运行时服务更新系统必须实现系统资源表（ESRT），它会记录组件和 GUID 的关系
4. 通过 UpdateCapsule 运行时服务更新系统，可以在引导服务退出后调用时返回 EFI_UNSUPPORTED
5. UpdateCapsule() 仅在 ExitBootServices() 被调用之前需要。UpdateCapsule() 实现预期适合由通用固件更新服务（如 fwupd ）使用。fwupd 会读取 ESRT 表来确定可以更新的固件，并使用 EFI 帮助程序应用程序在 ExitBootServices() 被调用之前调用 UpdateCapsule()。

## 8. ACPI要求

高级配置与电源接口规范为操作系统提供了系统配置、各种硬件资源、事件和电源管理的以 OS 为中心的视图。某些实现可能使用 RISC-V Functional Fixed Hardware Specification[^13]。

本节在现有 ACPI[^3] 和 UEFI[^2] 规范要求的基础上，定义了强制性和的 ACPI 要求

1. 必须是干净的64位。必须不实现 RSDT。RSDP 中的 RsdAddress 必需为0。32位地址段必须为0
2. 必须实现硬件简化 ACPI（无 FACS 表）
3. 必须实现处理器属性表 PPTT，即使系统具有简单的 hart 拓扑
4. MCFG 不得要求厂商特定的 OS 支持，MCFG 只能暴露兼容 ECAM 的描述，否则不应该存在 MCFG 表。
5. 如果不存在 EFI_GRAPHICS_OUTPUT_PROTOCOL 接口必须实现串口控制台 SPCR
6. 如果存在 SPCR 必须满足以下条件：
    - 版本4或者更新
    - 对于兼容 NS16550 的设备
        - 使用类型0x12
        - 必须存在匹配的AML设备对象，其硬件 ID(_HID)或兼容 ID(_CID)为 RSCV0003

### 8.1 方法和对象

本节列出了 ACPI 方法和对象的额外要求。
1. PCIe 根复合体的当前资源设置方法（_CRS）不应该返回任何 IO 描述（RISC-V 下没有 IO 操作）
2. _PRS 和 _SRS 设备方法应该不实现（和 IO 操作相关）
3. 每一个核心的设备必须定义在系统总线（_SB)名字空间下
4. 支持操作系统直接控制核心性能的系统应该通过 CPPC 暴露这些功能
5. 处理器空闲状态必须通过 _LPI 描述
6. 如果操作系统有可以使用的 RTC 必须实现 TAD[^16] 并实现 _GRT（获取时钟）和 _SRT（设置时钟）方法，_GCP 返回值必须置位比特2表示实现了获取和设置时钟的功能
7. 实现了 TAD[^16] 的系统必须在没有额外特定驱动的情况下工作
8. PLIC和APLIC设备对象必须支持全局系统中断基址（_GSB）对象
9. ID 为 RSCV0003 的 UART 设备对象必须实现 UART 设备属性。
10. 只要存在对应的 MADT 条目，PLIC/APLIC 命名空间设备就必须出现在 ACPI 命名空间中。

### 8.2 RVI 特定的 ACPI ID

ACPI ID 用于 _HID（硬件 ID）、_CID（兼容 ID）或 _SUB（子系统 ID）对象中，用于没有标准枚举机制的设备。ACPI ID 由两部分组成：厂商标识符后跟产品标识符。

厂商 ID 由 4 个字符组成，每个字符为大写字母 (A-Z) 或数字 (0-9)。厂商 ID 应在行业内唯一，并由 UEFI 论坛注册。对于 RVI 标准设备，RSCV 是已注册的厂商 ID。厂商特定设备可使用为其制造商注册的适当厂商 ID。

产品 ID 始终为四字符十六进制数 (0-9 和 A-F)。设备制造商负责为每个产品型号分配此标识符。

本文档包含符合 RVI 规范的命名空间设备的规范 ACPI ID 列表。RVI 任务组可针对此仓库提出 pull request 以请求为任何新设备分配 ACPI ID。

| ACPI ID	| 设备	|
|-----------|----------------|
|RSCV0001	|RISC-V 平台级中断控制器 (PLIC)	|
|RSCV0002	|RISC-V 高级平台级中断控制器 (APLIC)	|
|RSCV0003	|与使用接口类型 0x12 的 SPCR 定义兼容的 NS16550 UART	|
|RSCV0004	|作为平台设备实现的 RISC-V IOMMU	|
|RSCV0005	|RISC-V SBI 消息代理 (MPXY) 邮箱控制器	|
|RSCV0006	|RISC-V RPMI 系统 MSI 中断控制器	|

## 9. 外设

### 9.1 中断控制器

如果不存在 Incoming MSI Controller（IMSIC）[^12]，SBI需要实现S模式IPI扩展和RFENCE扩展。

PLIC 和 APLIC设备对象必须支持全局系统中断基址（_GSB）对象

只要存在对应的 MADT 条目，PLIC/APLIC 命名空间设备就必须出现在 ACPI 命名空间中。

RINTC（每个 hart）结构是强制性的。根据系统实现的中断控制器，MADT 还将包含 PLIC 或 APLIC 结构。

### 9.2 PCIe

#### 9.2.1 UEFI

每个 EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL 的实现都提供正确的地址转换偏移字段，以在 hart MMIO 和总线地址之间进行转换。

EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_CONFIGURATION 结构报告由 PCIe 根桥产生的资源，而不是其寄存器映射消耗的资源。在根桥后面有未填充的 PCIe 插槽的情况下，EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_CONFIGURATION 报告已分配的有效资源（例如用于热插拔），或报告没有分配资源。

固件必须始终初始化 PCIe 根复合体，即使从非 PCIe 设备引导，并且不应假设 OS 知道如何配置PCIe根复合体（包括例如入站和出站地址转换窗口）。事实上，ECAM 兼容的 PCIe 段被操作系统假设为根据其在 ACPI 和 DT 中的硬件描述正常工作。此外，固件必须执行 BAR 资源分配、桥总线号和窗口分配以及其他合理的设备设置配置（例如最大有效载荷大小），并且不要假设操作系统能够进行完整的 PCIe 资源配置，或期望完全重新配置是必要的。

#### 9.2.2 ACPI

在某些架构上，使用规范定义的 ACPI 表和对象来描述不符合《PCI 固件规范》[^15]的 PCIe 实现已成为行业公认的规范。符合 BRS 的 RISC-V 系统必须仅通过 MCFG 表和标准 AML 硬件 ID (_HID) PNP0A08 以及兼容 ID (_CID) PNP0A03 来公开 ECAM 兼容的实现，并且不得依赖 ACPI 表头信息或其他带外手段来检测 quirked 行为。

某些轻微的不兼容性，例如不正确的 CFG0 过滤、RC 的 BAR/能力损坏、嵌入式开关/桥接器或嵌入式端点，可以通过在特权固件（例如 M 模式）中仿真 ECAM 访问或类似设施（例如管理程序）来处理。

不符合要求的实现必须通过供应商特定机制公开（例如带有自定义_HID 的 AML 对象，如有必要则使用自定义供应商特定 ACPI 表）。在这种 PCIe 实现仅用于公开固定不可移除设备（例如 USB 主机控制器或 NVMe）的情况下，该设备可以通过 DSDT/SSDT MMIO 设备对象公开，而无需让 OS 知道底层的 PCIe 连接。

### 9.3 RTC

对于没有 RTC 设备但具有等效时钟源的系统，UEFI 运行时服务必须满足：
1. 运行时服务 GetTime() 必须实现
2. 运行时服务 SetTime() 必须返回EFI_UNSUPPORTED，并在EFI_RT_PROPERTIES_TABLE中适当描述
3. 引导服务退出后，如果 UEFI 无法访问时钟源，可通过time CSR模拟

如 RTC 设备位于操作系统可以访问的总线上，UEFI 需要满足以下条件：
1. 在退出引导服务之前，可以使用和操作系统相同的时钟源
2. 在引导服务退出后，GetTime() 和 SetTime()必须返回 EFI_UNSUPPORTED

如果操作系统有可以使用的 RTC 必须实现 TAD[^16]，并实现 _GRT 方法获取时钟和 _SRT 方法设置时钟。方法 _GCP 返回指的比特2需要置位，标识支持获取和时钟时钟。

实现了TAD的系统必须在没有额外特定驱动的情况下工作

### 9.4 串口

如果 UEFI 没有实现 EFI_GRAPHICS_OUTPUT_PROTOCOL 接口（可能因为没有显卡），必须实现 ACPI 串口控制台 SPCR。

早期串口控制台可以使用 NS16550 UART（SPCR 接口类型 0x12）、PL011 UART（SPCR 接口类型 0x03）或 SBI 控制台（SPCR 接口类型 0x15）实现。当 SPCR 描述 SBI 控制台时，OS 必须使用 SBI Probe 扩展（FID#3）来检测调试控制台扩展 (DBCN)。

SPCR第 4 版引入的新精确波特率字段，允许为 NS16550 兼容 UART 描述高于 115200 波特的速率。

无法进行中断驱动操作的硬件以及SBI 控制台应使用中断类型0和全局系统中断0来描述。

通用 16550 兼容 UART 设备可在全局命名空间中具有设备属性，因为操作系统已在使用它们。

|属性	        |类型	|描述|
|---------------|-------|----------------------|
|clock-frequency| 整数	| 以 Hz 为单位为 IP 块提供时钟。<br/>值为零将阻止设置波特率或配置已禁用的设备。|
|reg-offset		| 整数	| 应用于寄存器映射基地址的偏移量，从寄存器开始处计算。|
|reg-shift		| 整数	| 寄存器偏移量的移位量。|
|reg-io-width	| 整数	| 应对设备执行的寄存器访问大小（以字节为单位）。<br/>1、2、4 或 8。|
|fifo-size		| 整数	| FIFO 大小（以字节为单位）。|

## 参考文献

[^1]: [RISC-V Boot and Runtime Services (BRS) specification](https://github.com/riscv-non-isa/riscv-brs)

[^2]: [Unified Extensible Firmware Interface Specification](https://uefi.org/sites/default/files/resources/UEFI_Spec_2_10_Aug29.pdf)

[^3]: [Advanced Configuration and Power Interface Specification](https://uefi.org/sites/default/files/resources/ACPI_Spec_6_5_Aug29.pdf)

[^4]: [Device Tree Specification](https://github.com/devicetree-org/devicetree-specification)

[^5]: [RISC-V Supervisor Binary Interface Specification (SBI)](https://github.com/riscv-non-isa/riscv-sbi-doc)

[^6]: [System Management BIOS (SMBIOS) Reference Specification](https://www.dmtf.org/sites/default/files/standards/documents/DSP0134_3.8.0.pdf)

[^7]: [Embedded Base Boot Requirements Specification](http://github.com/ARM-software/ebbr/releases/download/v2.1.0/ebbr-v2.1.0.pdf)

[^8]: [Serial Port Console Redirection Table (SPCR)](http://learn.microsoft.com/en-us/windows-hardware/drivers/serports/serial-port-console-redirection-table)

[^9]: [PCI Express® Base Specification](http://pcisig.com/pci-express-6.0-specification)

[^10]: [UEFI Platform Initialization Specification](https://uefi.org/sites/default/files/resources/UEFI_PI_Spec_Final_Draft_1.9.pdf)

[^11]: [RISC-V Architecture Profiles](https://github.com/riscv/riscv-profiles)

[^12]: [The RISC-V Advanced Interrupt Architecture](https://github.com/riscv/riscv-aia)

[^13]: [RISC-V Functional Fixed Hardware Specification](http://github.com/riscv-non-isa/riscv-acpi-ffh)

[^14]: [TCG EFI Platform Specification](http://trustedcomputinggroup.org/resource/tcg-efi-platform-specification)

[^15]: [PCI Firmware Specification](http://members.pcisig.com/wg/PCI-SIG/document/folder/862)

[^16]: [ACPI Defined Time and Alarm Device](https://uefi.org/htmlspecs/ACPI_Spec_6_4_html/09_ACPI-Defined_Devices_and_Device-Specific_Objects/ACPIdefined_Devices_and_DeviceSpecificObjects.html#time-and-alarm-device)
