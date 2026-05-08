<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Claim extends Model
{
    protected $fillable = [
        'food_post_id',
        'user_id',
        'quantity',
        'notes',
        'status',
    ];

    public function foodPost(): BelongsTo
    {
        return $this->belongsTo(FoodPost::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
