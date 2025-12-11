<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

class ActivityTeam extends Pivot
{
    use SoftDeletes;

    protected $table = 'activity_team';

    // Disable auto-incrementing because this is a composite primary key
    public $incrementing = false;

    // Primary key type (string in your case)
    protected $keyType = 'string';

    // Allow mass assignment for both columns
    protected $fillable = [
        'activity_id',
        'intern_id',
    ];

    protected $dates = [
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    // Define relationships (optional, but useful)
    public function activity()
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }

    public function intern()
    {
        return $this->belongsTo(Intern::class, 'intern_id');
    }
}
