<?php

namespace App\Events;

use App\Models\FoodPost;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FoodPostCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public FoodPost $foodPost
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('marketplace'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'food-post.created';
    }

    public function broadcastWith(): array
    {
        return [
            'food_post' => $this->foodPost->load('user.profile'),
        ];
    }
}
