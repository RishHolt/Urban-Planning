import Swal from 'sweetalert2';
import type { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

class SwalComponent {
  // Basic alert
  static async fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
    return await Swal.fire(options);
  }

  // Success alert
  static async success(
    title: string, 
    text?: string, 
    options?: Partial<SweetAlertOptions>
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'success',
      title,
      text,
      ...options,
    } as SweetAlertOptions);
  }

  // Error alert
  static async error(
    title: string, 
    text?: string, 
    options?: Partial<SweetAlertOptions>
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'error',
      title,
      text,
      ...options,
    } as SweetAlertOptions);
  }

  // Warning alert
  static async warning(
    title: string, 
    text?: string, 
    options?: Partial<SweetAlertOptions>
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'warning',
      title,
      text,
      ...options,
    } as SweetAlertOptions);
  }

  // Info alert
  static async info(
    title: string, 
    text?: string, 
    options?: Partial<SweetAlertOptions>
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'info',
      title,
      text,
      ...options,
    } as SweetAlertOptions);
  }

  // Confirmation dialog
  static async confirm(
    title: string,
    text?: string,
    options?: Partial<SweetAlertOptions>
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Yes, confirm!',
      cancelButtonText: 'Cancel',
      ...options,
    } as SweetAlertOptions);
  }

  // Delete confirmation
  static async confirmDelete(
    title: string = 'Are you sure?',
    text: string = "You won't be able to revert this!",
    options?: Partial<SweetAlertOptions>
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      ...options,
    } as SweetAlertOptions);
  }

  // Loading alert
  static async loading(
    title: string = 'Loading...',
    text?: string
  ): Promise<void> {
    await Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  // Toast notification
  static async toast(
    title: string,
    icon: SweetAlertIcon = 'success',
    position: 'top' | 'top-end' | 'top-start' | 'center' | 'center-end' | 'center-start' | 'bottom' | 'bottom-end' | 'bottom-start' = 'top-end',
    timer: number = 3000
  ): Promise<SweetAlertResult> {
    return await Swal.fire({
      toast: true,
      position,
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast: any) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  // Input dialog
  static async input(
    title: string,
    inputType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'range' | 'textarea' | 'select' | 'radio' | 'checkbox' = 'text',
    options?: Partial<SweetAlertOptions>
  ): Promise<SweetAlertResult> {
    return this.fire({
      title,
      input: inputType,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      inputValidator: (value: string) => {
        if (!value) {
          return 'You need to write something!';
        }
        return null;
      },
      ...options,
    } as SweetAlertOptions);
  }

  // Close any open Swal
  static close(): void {
    Swal.close();
  }

  // Check if Swal is open
  static isVisible(): boolean {
    return Swal.isVisible();
  }
}

export default SwalComponent;

// Export individual methods for convenience
export const {
  fire,
  success,
  error,
  warning,
  info,
  confirm,
  confirmDelete,
  loading,
  toast,
  input,
  close,
  isVisible
} = SwalComponent;

// Export types for external use
export type { SweetAlertResult, SweetAlertIcon, SweetAlertOptions };