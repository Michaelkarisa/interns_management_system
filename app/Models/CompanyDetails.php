<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
class CompanyDetails extends Model
{
    use HasFactory, SoftDeletes;

    // The table associated with the model (optional if it follows Laravel convention)
    protected $table = 'company_details';
    protected $keyType = 'string'; // tell Eloquent the primary key is string
    public $incrementing = false;  // disable auto-increment

    // The attributes that are mass assignable
    protected $fillable = [
        'name',
        'email',
        'phone',
        'website',
        'address',
        'logo_path',
        'tax_id',
        'industry',
    ];

    // The attributes that should be hidden for arrays (optional)
    protected $hidden = [
        // e.g., sensitive info
    ];

    // The attributes that should be cast to native types
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
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
}
