package com.gluconoche.goal;

import com.gluconoche.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ApiResponse<ProgressResponse> getProgress() {
        return ApiResponse.ok(goalService.getProgress());
    }
}
