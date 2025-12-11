<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AuditLog extends Model
{
    use HasFactory;

     protected $keyType = 'string'; // tell Eloquent the primary key is string
    public $incrementing = false;  // disable auto-increment

    protected $fillable = [
        'id',
        'user_id',
        'event',
        'entity_type',
        'entity_id',
        'metadata',
        'ip',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        // Generate UUID on creation
        static::creating(function ($log) {
            if (empty($log->id)) {
                $log->id = strtoupper(str_replace('-', '', Str::uuid()));
            }
        });
    }

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
