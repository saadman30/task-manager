<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'due_date',
        'user_id'
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    public const STATUS_TODO = 'To Do';
    public const STATUS_IN_PROGRESS = 'In Progress';
    public const STATUS_DONE = 'Done';

    public static function getStatuses(): array
    {
        return [
            self::STATUS_TODO,
            self::STATUS_IN_PROGRESS,
            self::STATUS_DONE,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
} 