<?php

namespace App\Services;

use App\Services\ActivitiesService;
use App\Services\InternsService;

class DashboardService
{
    protected $activities;
    protected $interns;

    public function __construct(
        ActivitiesService $activitiesService,
        InternsService $internsService
    ) {
        $this->activities = $activitiesService;
        $this->interns = $internsService;
    }

    /**
     * Get all dashboard statistics.
     *
     * @return array
     */
    public function getDashboardStats(): array
    {
        $totalInterns        = $this->interns->count();
        $activeInterns       = $this->interns->activeInterns();
        $recommendedInterns  = $this->interns->recommendedInterns();
        $completedInterns    = $this->interns->completedInterns();
        $totalActivities     = $this->activities->count();
        $topPerforming       = $this->interns->getTopPerformingInterns();

        return [
            'totalInterns'       => $totalInterns,
            'activeInterns'      => $activeInterns,
            'recommendedInterns' => $recommendedInterns,
            'completedInterns'   => $completedInterns,
            'totalActivities'    => $totalActivities,
            'topInterns'         => $topPerforming,
        ];
    }
}
