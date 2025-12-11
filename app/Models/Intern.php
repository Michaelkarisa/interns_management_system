<?php

namespace App\Models;
use App\Models\ActivityTeam;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class Intern extends Model
{
    use HasFactory, SoftDeletes;

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
        'skills'     => 'array',
        'graduated'  => 'boolean',
        'recommended'=> 'boolean',
        'from'       => 'date',
        'to'         => 'date',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();

        // Generate UUID on creation
        static::creating(function ($intern) {
            if (empty($intern->id)) {
                $intern->id = strtoupper(str_replace('-', '', Str::uuid()));
            }
        });
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'intern_id');
    }

   /**
 * Activities where this intern is a team member (via activity_team pivot).
 */
public function activityTeams()
{
    return $this->belongsToMany(
            Activity::class,      // Related model
            'activity_team',      // Pivot table
            'intern_id',          // Foreign key on pivot table for this model
            'activity_id'         // Foreign key on pivot table for related model
        )
        ->using(ActivityTeam::class)  // Use custom pivot model
        ->withTimestamps()            // Include created_at & updated_at
        ->withPivot(['deleted_at']);  // Include deleted_at for soft deletes
}

}
