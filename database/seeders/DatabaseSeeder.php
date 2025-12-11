<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Intern;
use App\Models\Activity;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
     
User::factory()->create([
    'name' => 'Michael Karisa Kahindi',
    'email' => 'michaelkarisa49@gmail.com',
    'password' => Hash::make('Karisa4334?'), // properly hashed
    'role' => 'super_admin',
]);

        // -------------------------------------------------------------
        // 2. Create Interns
        // -------------------------------------------------------------
        $interns = Intern::factory(15)->create();

        // -------------------------------------------------------------
        // 3. Create Activities (each belongs to a random intern)
        // -------------------------------------------------------------
        $activities = Activity::factory(40)->make()->each(function ($activity) use ($interns) {
            // Assign a random existing intern as the owner
            $activity->intern_id = $interns->random()->id;
            $activity->save();
        });

        // -------------------------------------------------------------
        // 4. Assign random team members to activities (pivot)
        // -------------------------------------------------------------
        foreach ($activities as $activity) {
            // Pick random interns (2–5 interns per activity)
            $teamMembers = $interns->random(rand(2, 5))->pluck('id');

            // Attach to pivot table activity_team
            $activity->team()->sync($teamMembers);
        }
    }
}
