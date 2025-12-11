<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\ActivityTeam;

class Activity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'id',
        'intern_id',
        'title',
        'description',
        'impact',
        'url',
    ];

    public $incrementing = false;

    /**
     * Primary key type is string.
     */
    protected $keyType = 'string';

    /**
     * Boot method to generate UUID.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate UUID on creation
        static::creating(function ($activity) {
            if (empty($activity->id)) {
                $activity->id = strtoupper(str_replace('-', '', Str::uuid()));
            }
        });
    }

    /**
     * Main intern who created/performed this activity.
     */
    public function intern()
    {
        return $this->belongsTo(Intern::class, 'intern_id');
    }

    /**
     * Team members assigned to this activity.
     */
    /**
 * Team members assigned to this activity.
 */
public function team()
{
    return $this->belongsToMany(
            Intern::class,       // Related model
            'activity_team',     // Pivot table
            'activity_id',       // Foreign key on pivot table for this model
            'intern_id'          // Foreign key on pivot table for related model
        )
        ->using(ActivityTeam::class)   // Use custom pivot model
        ->withTimestamps()             // Include created_at & updated_at
        ->withPivot(['deleted_at']);   // Include deleted_at for soft deletes
}

}
