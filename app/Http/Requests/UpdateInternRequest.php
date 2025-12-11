<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInternRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $internId = $this->route('intern'); // uses route model binding

        return [
            'name'        => 'nullable|string|max:255',
            'phone'       => 'nullable|string|max:255',
            'email'       => ['nullable','email', Rule::unique('interns','email')->ignore($internId)],
            'institution' => 'nullable|string|max:255',
            'position'    => 'nullable|string|max:255',
            'course'      => 'nullable|string|max:255',
            'department'  => 'nullable|string|max:255',
            'supervisor'  => 'nullable|string|max:255',

            'from'        => 'nullable|date',
            'to'          => 'nullable|date|after_or_equal:from',

            'graduated'   => 'nullable|boolean',
            'recommended' => 'nullable|boolean',
            'performance' => 'nullable|numeric|min:0|max:100',

            'notes'       => 'nullable|string',

            'skills'      => 'nullable|array',
            'skills.*'    => 'nullable|string|max:255',

            'cv'    => 'nullable|file|mimes:pdf,doc,docx|max:4096',
            'photo' => 'nullable|image|max:4096',
        ];
    }
}
