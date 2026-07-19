import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

const SERVICE_ID  = 'service_8ji5nqg';
const TEMPLATE_ID = 'template_kpi4imi';
const PUBLIC_KEY  = 'Zlf-IT2ZLEBZmtxor';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  state: 'idle' | 'sending' | 'success' | 'error' = 'idle';

  async sendMessage() {
    if (!this.form.name || !this.form.email || !this.form.message) return;

    this.state = 'sending';

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name:  this.form.name,
          from_email: this.form.email,
          subject:    this.form.subject || 'General Inquiry',
          message:    this.form.message,
        },
        PUBLIC_KEY
      );
      this.state = 'success';
      this.form = { name: '', email: '', subject: '', message: '' };
    } catch (err) {
      console.error('EmailJS error:', err);
      this.state = 'error';
    }
  }

  reset() {
    this.state = 'idle';
  }
}
