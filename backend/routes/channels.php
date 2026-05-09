<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('admin', function ($user) {
    return (string) $user->role === 'admin';
});

Broadcast::channel('marketplace', function () {
    return true; // Public channel for all users
});

