<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInternRequest extends FormRequest
{
   public function authorize(): bool
    {
        return true; // allow all authenticated users
    }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'phone'        => 'required|string|max:255',
            'email'       => 'required|email|unique:interns,email',
            'institution' => 'nullable|string|max:255',
            'position'    => 'nullable|string|max:255',
            'course'      => 'nullable|string|max:255',
            'department'  => 'nullable|string|max:255',
            'supervisor'  => 'nullable|string|max:255',

            // dates
            'from'        => 'nullable|date',
            'to'          => 'nullable|date|after_or_equal:from',

            // booleans
            'graduated'   => 'boolean',
            'recommended' => 'boolean',

            // numeric
            'performance' => 'nullable|numeric|min:0|max:100',

            // text
            'notes'       => 'nullable|string',

            // skills array
            'skills'      => 'nullable|array',
            'skills.*'    => 'string|max:255',

            // files
            'cv'   => 'nullable|file|mimes:pdf,doc,docx|max:4096',     // 4MB
            'photo'=> 'nullable|image|max:4096', // jpeg, png, webp etc.
        ];
    }
}
