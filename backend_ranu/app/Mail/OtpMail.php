<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $otp;

    // Terima data user dan kode OTP saat dipanggil
    public function __construct($user, $otp)
    {
        $this->user = $user;
        $this->otp = $otp;
    }

    // Judul Email
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🔐 Kode Verifikasi Aradabiya',
        );
    }

    // Arahkan ke file desain (View)
    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}