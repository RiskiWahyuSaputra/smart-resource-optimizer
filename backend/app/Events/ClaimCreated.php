<?php

namespace App\Events;

use App\Models\Claim;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClaimCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Claim $claim
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            // Notify restaurant owner
            new PrivateChannel('user.' . $this->claim->foodPost->user_id),
            // Notify claimer
            new PrivateChannel('user.' . $this->claim->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'claim.created';
    }

    public function broadcastWith(): array
    {
        return [
            'claim' => $this->claim->load(['foodPost.user.profile', 'user.profile']),
        ];
    }
}
