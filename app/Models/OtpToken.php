<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class OtpToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Generate a new OTP token
     */
    public static function generateForEmail(string $email): self
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new \Exception('User not found');
        }

        // Invalidate any existing OTPs for this user
        self::where('user_id', $user->id)->delete();

        // Generate new 6-digit OTP
        $otpCode = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        // Set expiration to 3 minutes from now
        $expiresAt = Carbon::now()->addMinutes(3);

        return self::create([
            'user_id' => $user->id,
            'token' => $otpCode,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Verify OTP code
     */
    public static function verify(string $email, string $otpCode): bool
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            return false;
        }

        $token = self::where('user_id', $user->id)
            ->where('token', $otpCode)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($token) {
            $token->delete(); // Remove token after successful verification
            return true;
        }

        return false;
    }

    /**
     * Check if OTP is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Clean up expired tokens
     */
    public static function cleanupExpired(): int
    {
        return self::where('expires_at', '<', Carbon::now())->delete();
    }
}