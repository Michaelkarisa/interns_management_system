<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Intern;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    public function definition(): array
    {
        return [
            'id' => strtoupper(str_replace('-', '', Str::uuid()->toString())),
            'intern_id' => Intern::factory(),
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(2),
            'impact' => $this->faker->randomElement(['High', 'Medium', 'Low']),
            'url' => $this->faker->randomElement(['https://michaelkarisaportofolio.vercel.app/', 'https://4casualspage.vercel.app/', 'https://switch6-web.vercel.app/', 'https://my-offer.vercel.app/']),
        ];
    }
}
