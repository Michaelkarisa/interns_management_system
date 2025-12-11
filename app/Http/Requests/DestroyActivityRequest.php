<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DestroyActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        // You can add authorization logic here if needed
        return true;
    }

    public function rules(): array
    {
        return [
            'activity_id' => 'required|string|exists:activities,id',
            'intern_id'   => 'required|string|exists:interns,id',
        ];
    }

    public function messages(): array
    {
        return [
            'activity_id.required' => 'Activity ID is required.',
            'activity_id.exists'   => 'The specified activity does not exist.',
            'intern_id.required'   => 'Intern ID is required.',
            'intern_id.exists'     => 'The specified intern does not exist.',
        ];
    }
}
