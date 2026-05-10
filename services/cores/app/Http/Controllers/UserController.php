<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index() {
        $users = User::select('id', 'username', 'email', 'role', 'created_at')->get();
        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil daftar semua user',
            'data' => $users
        ], 200);
    }

    //
    public function promoteToAdmin(User $user)
    {

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => "User {$user->username} sudah berstatus Admin."
            ], 400);
        }

        $user->update(['role' => 'admin']);

        return response()->json([
            'success' => true,
            'message' => "User {$user->username} berhasil diangkat menjadi Admin",
            'data' => $user
        ], 200);
    }
}
