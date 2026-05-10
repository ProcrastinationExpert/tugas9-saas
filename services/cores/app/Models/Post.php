<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use DateTimeInterface;

class Post extends Model
{
    //
    protected $fillable = ['user_id', 'content'];

    /**
     * Get the user that owns the posts
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
