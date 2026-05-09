<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FoodPost extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'quantity',
        'quantity_unit',
        'pickup_address',
        'lat',
        'long',
        'available_until',
        'image_url',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'available_until' => 'datetime',
            'lat' => 'decimal:8',
            'long' => 'decimal:8',
        ];
    }

    public function getImageUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        return asset('storage/' . $value);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(Claim::class);
    }
}
