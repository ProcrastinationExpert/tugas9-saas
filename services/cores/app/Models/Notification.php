<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    //
    protected $fillable = ['user_id', 'sender_id', 'post_id', 'is_read'];

    /**
     * Get the notification sender
     */
    public function userSender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the notification receiver
     */
    public function userReceiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the notification post
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
