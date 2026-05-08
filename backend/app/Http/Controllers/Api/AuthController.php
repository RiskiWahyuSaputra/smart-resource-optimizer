<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Actions\Auth\RegisterUserAction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    public function register(Request $request, RegisterUserAction $action)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'string', 'in:restaurant,community'],
            'address' => ['required', 'string'],
        ]);

        $user = $action->execute($request->all());

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user->load('profile'),
            'token' => $token,
        ], 201);
    }
}
