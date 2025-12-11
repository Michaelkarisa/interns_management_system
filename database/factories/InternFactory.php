<?php

namespace Database\Factories;

use App\Models\Intern;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
class InternFactory extends Factory
{
    protected $model = Intern::class;

    public function definition(): array
    {
        return [
            'id' => strtoupper(str_replace('-', '', Str::uuid()->toString())),
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'position' => $this->faker->jobTitle(),
            'institution' => $this->faker->company(),
            'phone'=> $this->faker->phoneNumber(),
            'passport_photo' => null,
            'cv' => null,
            'course' => $this->faker->randomElement(['Computer Science', 'IT', 'Software Engineering', 'Business']),
            'from' => now()->subMonths(rand(1, 12))->format('Y-m-d'),
            'to' => rand(0, 1) ? now()->addMonths(rand(1, 12))->format('Y-m-d'): null,
            'department' => $this->faker->randomElement(['IT', 'HR', 'Finance', 'Marketing']),
            'graduated' => $this->faker->boolean(),
            'recommended' => $this->faker->boolean(),
            'performance' => $this->faker->numberBetween(30, 100),
            'skills' => $this->faker->randomElements(
                ['Laravel', 'React', 'Node.js', 'Python', 'Teamwork', 'Communication', 'UI/UX'],
                rand(2, 5)
            ),
            'notes' => null,
        ];
    }
}
