package com.gluconoche.goal;

import com.gluconoche.nightrecord.NightRecordRepository;
import com.gluconoche.person.CurrentPersonProvider;
import com.gluconoche.settings.AppSettings;
import com.gluconoche.settings.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoalService {

    private static final int FIRST_GOAL = 90;
    private static final int GOAL_INCREMENT = 40;

    private final NightRecordRepository nightRecordRepository;
    private final SettingsRepository settingsRepository;
    private final CurrentPersonProvider currentPersonProvider;

    @Transactional
    public ProgressResponse getProgress() {
        UUID personId = currentPersonProvider.getPersonId();
        long totalNights = nightRecordRepository.countByPersonId(personId);

        int[] goalThreshold = computeGoal(totalNights);
        int previousGoal = goalThreshold[0];
        int currentGoal  = goalThreshold[1];
        int goalIndex    = goalThreshold[2];
        String label = goalLabel(goalIndex + 1);

        long nightsToGo = Math.max(0, currentGoal - totalNights);
        double percent = previousGoal == currentGoal ? 100.0
                : ((double)(totalNights - previousGoal) / (currentGoal - previousGoal)) * 100.0;
        percent = Math.min(100.0, Math.max(0.0, percent));

        AppSettings settings = settingsRepository.findByPersonId(personId)
                .orElseThrow(() -> new IllegalStateException("Settings not found"));

        boolean isNew = false;
        if (totalNights >= currentGoal && settings.getLastUnlockedGoal() < currentGoal) {
            settings.setLastUnlockedGoal(currentGoal);
            settingsRepository.save(settings);
            isNew = true;
        }

        return ProgressResponse.builder()
                .totalNights(totalNights)
                .currentGoal(currentGoal)
                .previousGoal(previousGoal)
                .goalLabel(label)
                .percentComplete(Math.round(percent * 10.0) / 10.0)
                .nightsToGo(nightsToGo)
                .isNewGoalUnlocked(isNew)
                .build();
    }

    // Returns [previousGoal, currentGoal, zeroBasedGoalIndex]
    private static int[] computeGoal(long nights) {
        int prev = 0;
        int goal = FIRST_GOAL;
        int index = 0;
        while (nights >= goal) {
            prev = goal;
            goal += GOAL_INCREMENT;
            index++;
        }
        return new int[]{ prev, goal, index };
    }

    private static String goalLabel(int number) {
        return switch (number) {
            case 1  -> "Primera temporada";
            case 2  -> "Segunda temporada";
            case 3  -> "Tercera temporada";
            case 4  -> "Cuarta temporada";
            case 5  -> "Quinta temporada";
            case 6  -> "Sexta temporada";
            case 7  -> "Séptima temporada";
            case 8  -> "Octava temporada";
            case 9  -> "Novena temporada";
            case 10 -> "Décima temporada";
            default -> "Temporada " + number;
        };
    }
}
