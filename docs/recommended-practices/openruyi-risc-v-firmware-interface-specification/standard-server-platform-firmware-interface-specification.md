---
id: standard-server-platform-firmware-interface-specification
title: Standard Server Platform Firmware Interface Specification
description: This document describes the firmware interface specification for standard server platforms.
slug: /guide/recommended-practices/openruyi-risc-v-firmware-interface-specification/standard-server-platform-firmware-interface-specification
---

# Standard Server Platform Firmware Interface Specification

## 1. Introduction

With the rapid development of the RISC-V open instruction set architecture, the openRuyi team is pushing more real-world hardware platforms into the stage of running general-purpose operating systems. The openRuyi project is dedicated to building an operating system that can run on a variety of RISC-V processors and SoCs, and one of its core design goals is to minimize customization modifications for specific hardware platforms or specific firmware implementations.

To this end, the "openRuyi RISC-V Firmware Interface Specification" defines the minimum consistency requirements and expected behaviors of the Ruyi operating system for the underlying firmware (including the bootloader, SBI, UEFI, ACPI, Device Tree, etc.). Only when the firmware provided by the vendor meets the interface conventions, mandatory functions, and data structure formats described in this specification can the Ruyi operating system achieve relatively direct startup and operation on the corresponding hardware without requiring a large number of platform-specific patches.

The objectives of this specification are:
1. Provide hardware manufacturers and firmware developers with clear guidelines for developing “openRuyi OS-compatible firmware”
2. The technical basis used by the Ruyi operating system to determine whether a target platform meets the basic operating requirements
3. Reduce the engineering costs and maintenance burden associated with porting and adapting the Ruyi operating system across different RISC-V hardware platforms

The current version of the specification is still in the early stages of development, and some details are still being validated and refined based on practical implementation experience. Future versions may refine, adjust, or add new mandatory or optional requirements. However, the fundamental goal remains unchanged: through standardized cooperation at the firmware level, to enable the Ruyi operating system to be “out-of-the-box” or nearly “out-of-the-box” on as many RISC-V platforms as possible that comply with the specification.

During the drafting of this specification, the RISC-V Boot and Runtime Services (BRS)[^1] were consulted, and adjustments and adaptations were made based on the specific characteristics of the openRuyi operating system’s kernel architecture.

The openRuyi development team encourages and welcomes hardware manufacturers, firmware implementers, and community developers to implement, test, and provide feedback based on this specification. Any issues encountered during the adaptation process—such as unclear interfaces, difficult-to-meet requirements, behavior conflicts, or challenges caused by actual hardware limitations—will serve as valuable input for optimizing future versions.

## 2. Terms and definitions

The terms used in this specification are defined as follows:
1. firmware：Programs stored in non-volatile memory such as ROM and EPROM are responsible for initializing the hardware and can also provide runtime services after the system boots up.
2. SBI（Supervisor Binary Interface）：The code runs in machine mode and provides a supervisor execution environment
3. DT（Device Tree）：A data structure for describing hardware. It can also be used for parameter passing.
4. UEFI：Unified Extensible Firmware Interface Specification.
5. ACPI：Advanced Configuration and Power Interface Specification.
6. SMBIOS：System Management BIOS (SMBIOS) Reference Specification.
7. BRS：RISC-V Boot and Runtime Services Specificatio is designed to provide unified, open support for boot and runtime services on the RISC-V platform.
8. SoC：System on Chip. A single chip encapsulates the processor and some on-chip peripherals.

## 3. Processor

The HART running the operating system must be compatible with RVA20S64[^11], and compatibility with RVA23S64[^11] is recommended.

Before the UEFI exits the boot service, all internal firmware operations need to be completed, and the secondary HART needs to be put offline.

### 3.1 ACPI

Processor Properties Table (PPTT) must be implemented, even if the system has a simple HART topology.

HART device objects must be defined in the system bus (_SB) namespace, not the discarded processor namespace (_PR).

### 3.2 SMBIOS

#### 3.2.1 Type 04 Processor Information

Used to record processor information; a processor refers to a set of HARTs within a physical package. Typically, a processor refers to an SoC.

For RISC-V, the processor ID field contains two DWORD values that describe the manufacturer and version of the entire physical processor package. In some implementations, this is also referred to as the SoC ID. The first DWORD (offset 08h–0Bh) is the vendor’s JEP-106 code, where bits 6:0 represent the ID without parity, and bits 31:7 indicate the number of continuation codes. The second DWORD (offset 0Ch–0Fh) reflects vendor-specific device version information.


#### 3.2.2 Type 44 Processor-Specific Data

A Type 44 processor description must be provided for each HART; the fields of the processor-specific data structure conform to the definitions in the SMBIOS standard [^6] (Section 7.45.1).

This structure is valid only when the processor is declared as a RISC-V processor (type 07h). Described in the table below.

|Offset | Length | Description  |
|-------|--------|-----------|
| 00h	  | WORD	 | Version. The table matches the current description only when BRS version is 1.0 (0100h). |
| 02h	  | QWORD	 | HART ID   |
| 0Ah	  | QWORD	 | Machine Vendor ID |
| 12h	  | QWORD	 | Machine Architecture ID. Base microarchitecture of the HART. 0 indicates not implemented. Together with the vendor ID, it can uniquely identify the microarchitecure of the HART. |
| 1Ah	 | QWORD	 | Machine Implementation ID. Unique encoding of the version of the processor implementation. |

Version, A WORD is divided into high and low bytes, with the high byte representing the major version number and the low byte representing the minor version number. The current version is 1.0, which corresponds to 0100h. If a new field is added and the change is backward-compatible, the minor version number is incremented. If the change is incompatible, the major version number is incremented.

The Machine Vendor ID, Machine Architecture ID, and Machine Implementation ID fields typically correspond to the mvendorid, marchid, and mimpid CSRs, respectively.

### 3.3 Power and Performance

Processor idle states must be described using Low Power Idle (_LPI).

Systems supporting OS-directed HART performance control and power management must expose these via Collaborative Processor Performance Control (CPPC).

## 4. Memory Mapping

The default memory space attribute is EFI_MEMORY_WB.

Paged virtual-memory scheme must be configured by the firmware with identity mapping and must support EFI_MEMORY_ATTRIBUTE_PROTOCOL protocol.

Only use EfiRuntimeServicesData memory type for describing any SMBIOS data structures.

## 5. SBI

RISC-V Supervisor Binary Interface Specification (SBI)[^5] defines the interface between the supervisor model and the machine model.This section primarily describes the SBI requirements for running the openRuyi operating system.

The following are the requirements that must be met:
1. Must be compatible with version 2.0 or later
2. The HSM extension must be implemented; this extension is used to start, stop, pause, and query the HART's status.

The following requirements must be met even if some ISA extensions are missing
1. If the HART does not have a stimecmp/vstimecmp status control register (Sstc), SBI must implement the Timer Extension (TIME).
2. If the HART does not support the Incoming MSI Controller (IMSIC) [^12], the S-Mode IPI extension (SPI) must be implemented.
3. If the HART does not support the Incoming MSI Controller (IMSIC) [^12], the RFENCE extension (RFNC) must be implemented.
4. If the S-Mode ISA extensions related to counter delegation (Sscsrind and Ssccfg) are not present, the Performance Monitoring Unit (PMU) must be implemented.
5. If the ACPI SPCR[^8] table references interface type 0x15, the Debug Console Extension (DBCN) must be implemented.

## 6. Device Tree

Device Tree[^4] must be compatible with v0.3 or later. The Device Tree passed to the operating system should not contain any hardware information. In this case, the Device Tree can be used for parameter passing.

## 7. UEFI

The Unified Extensible Firmware Interface (UEFI) specification [^2] defines the interface between the operating system and the firmware in supervisor mode. The UEFI version should be 2.1.0 or later and meet the EBBR[^7] requirements. Different parts of the system firmware may be designed for specific privilege levels. In contrast, UEFI drivers, OS loaders, and pre-boot applications must run in supervised mode (VS-Mode or HS-Mode) because they are UEFI-compliant executable images.

As an implementation option, the UEFI firmware can begin execution in machine mode. However, it must switch to supervisor mode when initializing UEFI drivers and the boot and runtime services for applications.

1. Must implement a 64-bit UEFI firmware.
2. Must meet the 3rd Party UEFI Certificate Authority (CA) requirements on UEFI memory mitigations.
3. An implementation may comply with the UEFI Platform Initialization Specification[^10].
4. All HART manipulation internal to a firmware implementation should be done before completion of the EFI_EVENT_GROUP_READY_TO_BOOT event. And must place all secondary harts in an offline.
5. The implementation must declare the EFI_CONFORMANCE_PROFILES_UEFI_SPEC_GUID conformance profile. Indicates that the UEFI firmware complies with the “Required” section of the UEFI specification.
6. The implementation must declare the EFI_CONFORMANCE_PROFILES_UEFI_SPEC_GUID conformance profile. Indicates that the UEFI firmware complies with the requirements of riscv-brs 1.0

### 7.1 IO Requirements

Systems implementing PCIe[^9] must always initialize all root complex hardware and perform resource assignment for all endpoints and usable hotplug-capable switches in the system, even in a boot scenario from a non-PCIe boot device.

Systems implementing EFI_GRAPHICS_OUTPUT_PROTOCOL SHOULD configure the frame buffer to be directly accessible. That is, EFI_GRAPHICS_PIXEL_FORMAT is not PixelBltOnly and FrameBufferBase is reported as a valid hart memory-mapped I/O address.

### 7.2 Runtime Services

The following are UEFI's requirements for runtime services:
1. Systems without a Real-Time Clock (RTC), but with an equivalent alternate source for the current time, must meet the following requirements:
	- GetTime() must be implemented.
	- SetTime() must return EFI_UNSUPPORTED, and be appropriately described in the EFI_RT_PROPERTIES_TABLE.
2. Systems with a Real-Time Clock on an OS-managed bus (can be accessed by the operating system) must meet the following requirements:
	- GetTime() and SetTime() must return EFI_UNSUPPORTED, when called after the UEFI boot services have been exited, and must operate on the same hardware as the ACPI TAD before UEFI boot services are exited.
	- GetTime() and SetTime() must be appropriately described in the EFI_RT_PROPERTIES_TABLE.
3. The UEFI ResetSystem() runtime service must be implemented. The OS must call the ResetSystem() runtime service call to reset or shutdown the system, preferring this to SBI, ACPI or other system-specific mechanisms. This allows for systems to perform any required system tasks on the way out (e.g. servicing UpdateCapsule() or persisting non-volatile variables in some systems).
4. The non-volatile UEFI variables must persist across calls to the ResetSystem() runtime service call.
5. UEFI runtime services must be able to update the UEFI variables directly without the aid of an OS.

### 7.3 Security Requirements

The following are the UEFI security requirements:

1. Systems implementing a TPM must implement the TCG EFI Protocol Specification[^14].
2. Systems with UEFI secure boot must support a minimum of 128 KiB of non-volatile storage for UEFI variables.
3. For systems with UEFI secure boot, the maximum supported variable size must be at least 64 KiB.
4. For systems with UEFI secure boot, the db signature database variable (EFI_IMAGE_SECURITY_DATABASE) must be created with EFI_VARIABLE_TIME_BASED_AUTHENTICATED_WRITE_ACCESS, to prevent rollback attacks.
5. For systems with UEFI secure boot, the dbx signature database variable (EFI_IMAGE_SECURITY_DATABASE1) must be created with
EFI_VARIABLE_TIME_BASED_AUTHENTICATED_WRITE_ACCESS, to prevent rollback attacks.

### 7.4 Firmware Update

UEFI provides a standardized method for delivering firmware, encapsulating update data (code or configuration) and metadata within a binary object called a “capsule.” The following are the requirements for firmware updates:
1. Systems with in-band firmware updates must do so either via UpdateCapsule() UEFI runtime service or via Delivery of Capsules via file on Mass Storage Device.
2. Systems implementing in-band firmware updates via UpdateCapsule() must accept updates in the Firmware Management Protocol Data Capsule Structure format as described in Delivering Capsules Containing Updates to Firmware Management Protocol.
3. Systems implementing in-band firmware updates via UpdateCapsule() must provide an ESRT describing every firmware image that is updated in-band.
4. Systems implementing in-band firmware updates via UpdateCapsule() may return EFI_UNSUPPORTED, when called after the UEFI boot services have been exited.
5. UpdateCapsule() is only required before ExitBootServices() is called. The implementation of UpdateCapsule() is intended for use by generic firmware update services, such as fwupd. fwupd reads the ESRT table to determine which firmware can be updated and uses the EFI helper application to call UpdateCapsule() before ExitBootServices() is called.

## 8. ACPI Requirements

The Advanced Configuration and Power Interface (ACPI) specification provides the operating system with an OS-centric view of system configuration, various hardware resources, events, and power management. Some implementations may use the RISC-V Functional Fixed Hardware Specification[^13].


This section defines mandatory ACPI requirements based on the existing ACPI[^3] and UEFI[^2] specifications.

1. Be 64-bits clean. RSDT must not be implemented, with RsdtAddress in RSDP set to 0. 32-bit address fields must be 0.
2. Must implement the hardware-reduced ACPI mode (no FACS table).
3. The Processor Properties Table (PPTT) must be implemented, even on systems with a simple hart topology.
4. MCFG(PCI Memory-mapped Configuration Space table) must not require support for a specific operating system; MCFG must only expose ECAM(Enhanced Configuration Access Mechanism)-compatible descriptions; otherwise, an MCFG table should not exist.
5. If the EFI_GRAPHICS_OUTPUT_PROTOCOL interface does not exist, the serial console SPCR(Serial Port Console Redirection Table) must be implemented.
6. If SPCR is present, the following conditions must be met:
    - Revision 4 or later
    - For NS16550-compatible UARTs:
        - Use Interface Type 0x12
        - There must be a matching AML device object with _HID (Hardware ID) or _CID (Compatible ID) RSCV0003.

### 8.1 Methods and Objects

This section lists additional requirements for ACPI methods and objects.

1.  The Current Resource Setting (_CRS) device method for a PCIe Root Complex should not return any descriptors for I/O ranges (such as created by ASL macros WordIO, DWordIO, QWordIO, IO, FixedIO, or ExtendedIO).
2.  The Possible Resource Settings (_PRS) and Set Resource Settings (_SRS) device method should not be implemented.
3.  Hart device objects must be defined under _SB (System Bus) namespace and not in the deprecated _PR (Processors) namespace.
4.  Systems supporting OS-directed hart performance control and power management must expose these via Collaborative Processor Performance Control.
5.  Processor idle states must be described using Low Power Idle(_LPI)
6.  Systems with a Real-Time Clock on an OS-managed bus must implement the Time and Alarm Device (TAD) with functioning _GRT and _SRT methods, and the _GCP method returning bit 2 set (i.e. get/set real time features implemented).
7.  Systems implementing a TAD[^16] must be functional without additional system-specific OS drivers.
8.  PLIC and APLIC device objects must support the Global System Interrupt Base object(_GSB).
9.  UART device objects with ID RSCV0003 must implement Properties for UART Devices.
10. PLIC/APLIC namespace devices must be present in the ACPI namespace whenever corresponding MADT entries are present.

### 8.2 RVI-specific ACPI IDs

ACPI ID is used in the _HID (Hardware ID), _CID (Compatible ID) or _SUB (Subsystem ID) objects as described in the ACPI Specification for devices, that do not have a standard enumeration mechanism. The ACPI ID consists of two parts: a vendor identifier followed by a product identifier.

Vendor IDs consist of 4 characters, each character being either an uppercase letter (A-Z) or a numeral (0-9). The vendor ID SHOULD be unique across the Industry and registered by the UEFI forum. For RVI standard devices, RSCV is the vendor ID registered. Vendor-specific devices can use an appropriate vendor ID registered for the manufacturer.

Product IDs are always four-character hexadecimal numbers (0-9 and A-F). The device manufacturer is responsible for assigning this identifier to each product model.

This document contains the canonical list of ACPI IDs for the namespace devices that adhere to the RVI specifications. The RVI task groups may make pull requests against this repository to request the allocation of ACPI ID for any new device.
| ACPI ID	| Device	|
|-----------|----------------|
|RSCV0001	|RISC-V Platform-Level Interrupt Controller (PLIC)	|
|RSCV0002	|RISC-V Advanced Platform-Level Interrupt Controller (APLIC)|
|RSCV0003	|NS16550 UART compatible with an SPCR definition using Interface Type 0x12	|
|RSCV0004	|RISC-V IOMMU implemented as a platform device	|
|RSCV0005	|RISC-V SBI Message Proxy (MPXY) Mailbox Controller	|
|RSCV0006	|RISC-V RPMI System MSI Interrupt Controller	|

## 9. Peripherals

### 9.1 Interrupt Controller

If the HART does not support the Incoming MSI Controller (IMSIC) [^12], the SBI extension IPI and RFENCE must be implemented.

PLIC and APLIC device objects must support the Global System Interrupt Base object(_GSB).

PLIC/APLIC namespace devices must be present in the ACPI namespace whenever corresponding MADT entries are present.

RINTC (per-hart) structures are mandatory. Depending on the interrupt controller implemented by the system, the MADT will also contain either PLIC or APLIC structures.

### 9.2 PCIe

#### 9.2.1 UEFI

Every implementation of the EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL provides the correct Address Translation Offset field to translate between the hart MMIO and bus addresses.

EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_CONFIGURATION structures report resources produced by the PCIe root bridges, not resources consumed by their register maps. In the cases where there are unpopulated PCIe slots behind a root bridge, EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_CONFIGURATION reports valid resources assigned (e.g. for hot plug), or reports no resources assigned.


Firmware must always initialize PCIe root complexes, even if booting from non-PCIe devices, and should not assume the OS knows how to configure root complex hardware (including, for example, inbound and outbound address translation windows). In fact, ECAM-compatible PCIe segments are assumed by operating systems to just work as per their hardware descriptions in ACPI and DT. Furthermore, firmware must perform BAR resource assignment, bridge bus number and window assignments and other reasonable device setting configuration (e.g. Max Payload Size) and not assume operating systems to be capable of full PCIe resource configuration, or to expect full reconfiguration to be necessary.
参考文献
#### 9.2.2 ACPI

On some architectures, it became an industry accepted norm to describe PCIe implementations not compliant to the PCI Firmware Specification [17] using specification-defined ACPI tables and objects. RISC-V systems compliant to the BRS must only expose ECAM-compatible implementations using the MCFG and the standard AML Hardware ID (_HID) PNP0A08 and Compatible ID (_CID) PNP0A03, and must not rely on ACPI table header information or other out-of-band means of detecting quirked behavior.

Some minor incompatibilities, such as incorrect CFG0 filtering, broken BARs/capabilities for RCs, embedded switches/bridges or embedded endpoints can be handled by emulating ECAM accesses in privileged firmware (e.g. M-mode) or similar facilities (e.g. a hypervisor).

Non-compliant implementations must be exposed using vendor-specific mechanisms (e.g. AML object with custom _HID, custom vendor-specific ACPI table if necessary). In cases where such PCIe implementations are only used to expose a fixed non-removable device (e.g. USB host controller or NVMe), the device could be exposed via a DSDT/SSDT MMIO device object without making the OS aware of the underlying PCIe connection.

### 9.3 RTC

Systems without a Real-Time Clock (RTC), but with an equivalent alternate source for the current time, must meet the following requirements:
1. GetTime() must be implemented.
2. SetTime() must return EFI_UNSUPPORTED, and be appropriately described in the EFI_RT_PROPERTIES_TABLE.
3. After the boot service exits, if UEFI cannot access the clock source, it can be emulated using the time CSR.

Systems with a Real-Time Clock on an OS-managed bus (can be accessed by the operating system) must meet the following requirements:
1. GetTime() and SetTime() must return EFI_UNSUPPORTED, when called after the UEFI boot services have been exited, and must operate on the same hardware as the ACPI TAD before UEFI boot services are exited.
2. GetTime() and SetTime() must be appropriately described in the EFI_RT_PROPERTIES_TABLE.

Systems with a Real-Time Clock on an OS-managed bus must implement the Time and Alarm Device (TAD)[^16] with functioning _GRT and _SRT methods, and the _GCP method returning bit 2 set (i.e. get/set real time features implemented).

Systems implementing a TAD[^16] must be functional without additional system-specific OS drivers.

### 9.4 Serial Console

If the EFI_GRAPHICS_OUTPUT_PROTOCOL interface does not exist, the serial console SPCR(Serial Port Console Redirection Table) must be implemented.

Early serial console can be implemented using either an NS16550 UART (SPCR Interface Type 0x12), a PL011 UART (SPCR Interface Type 0x03), or an SBI console (SPCR Interface Type 0x15). When SPCR describes SBI console, the OS must use the SBI Probe extension (FID #3) to detect the Debug Console Extension (DBCN).

The new Precise Baud Rate field, introduced in rev. 4, allows describing rates faster than 115200 baud for NS16550-compatible UARTS.

Hardware not capable of interrupt-driven operation and SBI console should be described with Interrupt Type of 0 and Global System Interrupt of 0.

Generic 16550-compatible UART devices can have device properties in the global name space since Operating Systems are already using them.

|Property	      |Type	    |Description|
|---------------|---------|----------------------|
|clock-frequency| Integer	| Clock feeding the IP block in Hz.<br/>A value of zero will preclude the ability to set the baud rate, or to configure a disabled device. |
|reg-offset		  | Integer	| Offset to apply to the register map base address from the start of the registers. |
|reg-shift		  | Integer	| Quantity to shift the register offsets by. |
|reg-io-width	  | Integer	| The size (in bytes) of the register accesses that should be performed on the device. <br/>1, 2, 4 or 8. |
|fifo-size		  | Integer	| The FIFO size (in bytes). |

## Reference

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
