<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::orderBy('updated_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $posts
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);
        
        $post = Post::create([
            'user_id' => auth()->id(),
            'content' => $request->content,
        ]);

        // payload untuk RabbitMQ
        $payload = json_encode([
            'post_id'   => $post->id,
            'sender_id' => auth()->id(),
            'content'   => $post->content,
        ]);

        try {
            $connection = new AMQPStreamConnection(
                env('RABBITMQ_HOST', '127.0.0.1'),
                env('RABBITMQ_PORT', 5672),
                env('RABBITMQ_USER', 'guest'),
                env('RABBITMQ_PASSWORD', 'guest'),
                env('RABBITMQ_VHOST', '/')
            );
            $channel = $connection->channel();

            // nama queue = post_mentions
            $channel->queue_declare('post_mentions', false, true, false, false);

            $msg = new AMQPMessage($payload, ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]);
            $channel->basic_publish($msg, '', 'post_mentions');

            $channel->close();
            $connection->close();

            return response()->json([
                'success' => true,
                'message' => 'Post berhasil dibuat',
                'post' => $post
            ], 201);

        } catch (\Exception $e) {
            // Log error jika koneksi atau pengiriman pesan gagal
            \Log::error('RabbitMQ Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat post'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        //
        return response()->json([
            'success' => true,
            'data' => $post
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        //
        // check if there is a post with the given id
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post tidak ditemukan'
            ], 404);
        }

        if ($post->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak bisa mengedit post milik orang lain.'
            ], 403);
        }

        if ($request->has('content')) {
            $request->validate([
                'content' => 'sometimes|required|string|max:1000',
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Content dibutuhkan untuk update post'
            ], 400);
        }

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post tidak ditemukan'
            ], 404);
        }

        $post->update($request->only('content'));

        $payload = json_encode([
            'post_id'   => $post->id,
            'sender_id' => auth()->id(),
            'content'   => $post->content,
        ]);
        
        try {
            $connection = new AMQPStreamConnection(
                env('RABBITMQ_HOST', '127.0.0.1'),
                env('RABBITMQ_PORT', 5672),
                env('RABBITMQ_USER', 'guest'),
                env('RABBITMQ_PASSWORD', 'guest'),
                env('RABBITMQ_VHOST', '/')
            );
            $channel = $connection->channel();

            // nama queue = post_mentions
            $channel->queue_declare('post_mentions', false, true, false, false);

            $msg = new AMQPMessage($payload, ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]);
            $channel->basic_publish($msg, '', 'post_mentions');

            $channel->close();
            $connection->close();

            return response()->json([
                'success' => true,
                'message' => 'Post berhasil diperbarui',
                'post' => $post
            ], 200);

        } catch (\Exception $e) {
            // Log error jika koneksi atau pengiriman pesan gagal
            \Log::error('RabbitMQ Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui post'
            ], 500);
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        //
        if ($post->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak bisa mengedit post milik orang lain.'
            ], 403);
        }

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post tidak ditemukan'
            ], 404);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post berhasil dihapus'
        ], 200);
    }
}
