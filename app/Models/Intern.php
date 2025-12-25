<?php

namespace App\Models;

use App\Models\Activity;
use App\Models\ActivityTeam;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Intern extends Model
{
    use HasFactory, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'email',
        'position',
        'institution',
        'passport_photo',
        'cv',
        'course',
        'from',
        'to',
        'department',
        'graduated',
        'recommended',
        'performance',
        'skills',
        'notes',
        'phone',
    ];

    protected $casts = [
        'skills'      => 'array',
        'graduated'   => 'boolean',
        'recommended' => 'boolean',
        'from'        => 'date',
        'to'          => 'date',
    ];

    protected $appends = [
        'avatar_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($intern) {
            if (empty($intern->id)) {
                $intern->id = strtoupper(str_replace('-', '', Str::uuid()));
            }
        });
    }

    /* ----------------------------------------------------
     | Relationships
     | ----------------------------------------------------
     */

    public function activities()
    {
        return $this->hasMany(Activity::class, 'intern_id');
    }

    public function activityTeams()
    {
        return $this->belongsToMany(
                Activity::class,
                'activity_team',
                'intern_id',
                'activity_id'
            )
            ->using(ActivityTeam::class)
            ->withTimestamps()
            ->withPivot(['deleted_at']);
    }

    /* ----------------------------------------------------
     | Accessors
     | ----------------------------------------------------
     */

    /**
     * Avatar URL (browser / API)
     */
    public function getAvatarUrlAttribute(): string
    {
        return $this->passport_photo
            ? asset('storage/' . ltrim($this->passport_photo, '/'))
            : asset('images/default-avatar.png');
    }

    /**
     * Absolute avatar path (PDF / filesystem)
     */
    public function getAvatarPathAttribute(): ?string
    {
        if (!$this->passport_photo) {
            return null;
        }

        if (!Storage::disk('public')->exists($this->passport_photo)) {
            return null;
        }

        return Storage::disk('public')->path($this->passport_photo);
    }
}
