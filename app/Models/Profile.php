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
        'document_url'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
