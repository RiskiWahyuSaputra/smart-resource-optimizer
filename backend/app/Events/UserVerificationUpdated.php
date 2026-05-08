<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserVerificationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $userId,
        public string $verificationStatus
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-user.' . $this->userId),
            new PrivateChannel('private-admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.verification.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'verification_status' => $this->verificationStatus,
        ];
    }
}

