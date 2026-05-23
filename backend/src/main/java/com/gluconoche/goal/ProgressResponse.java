package com.gluconoche.goal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgressResponse {
    private long totalNights;
    private int currentGoal;
    private int previousGoal;
    private String goalLabel;
    private double percentComplete;
    private long nightsToGo;
    private boolean isNewGoalUnlocked;
}
