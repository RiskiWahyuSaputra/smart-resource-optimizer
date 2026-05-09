<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'address',
        'lat',
        'long',
        'verification_status',
        'document_url',
        'store_image_url',
    ];

    public function getStoreImageUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        return asset('storage/' . $value);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
