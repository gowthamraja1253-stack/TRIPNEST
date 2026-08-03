package com.tripnest.expense.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.expense.dto.CreateExpenseRequest;
import com.tripnest.expense.dto.ExpenseResponse;
import com.tripnest.expense.dto.UpdateExpenseRequest;
import com.tripnest.expense.entity.ExpenseCategory;
import com.tripnest.expense.service.ExpenseService;
import com.tripnest.security.config.PasswordConfig;
import com.tripnest.security.config.SecurityConfig;
import com.tripnest.security.jwt.JwtTokenProvider;
import com.tripnest.security.user.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ExpenseController.class)
@Import({SecurityConfig.class, PasswordConfig.class})
public class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(username = "testuser")
    public void testAddExpenseSuccess() throws Exception {
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setTitle("Dinner");
        request.setAmount(150.0);
        request.setDescription("Delicious seafood dinner");
        request.setCategory(ExpenseCategory.FOOD);
        request.setExpenseDate(LocalDate.of(2026, 8, 1));

        ExpenseResponse response = ExpenseResponse.builder()
                .id(100L)
                .tripId(1L)
                .title("Dinner")
                .amount(150.0)
                .description("Delicious seafood dinner")
                .category(ExpenseCategory.FOOD)
                .expenseDate(LocalDate.of(2026, 8, 1))
                .build();

        when(expenseService.addExpense(eq(1L), any(CreateExpenseRequest.class), eq("testuser")))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/trips/1/expenses")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("Dinner"))
                .andExpect(jsonPath("$.amount").value(150.0))
                .andExpect(jsonPath("$.category").value("FOOD"));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testGetTripExpensesSuccess() throws Exception {
        ExpenseResponse exp1 = ExpenseResponse.builder()
                .id(100L)
                .tripId(1L)
                .title("Taxi")
                .amount(45.0)
                .description("Taxi to hotel")
                .category(ExpenseCategory.TRANSPORTATION)
                .expenseDate(LocalDate.of(2026, 8, 1))
                .build();

        ExpenseResponse exp2 = ExpenseResponse.builder()
                .id(101L)
                .tripId(1L)
                .title("Hotel")
                .amount(500.0)
                .description("Resort booking")
                .category(ExpenseCategory.HOTEL)
                .expenseDate(LocalDate.of(2026, 8, 2))
                .build();

        when(expenseService.getExpensesByTrip(1L, "testuser")).thenReturn(List.of(exp1, exp2));

        mockMvc.perform(get("/api/v1/trips/1/expenses")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title").value("Taxi"))
                .andExpect(jsonPath("$[1].title").value("Hotel"));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testUpdateExpenseSuccess() throws Exception {
        UpdateExpenseRequest request = new UpdateExpenseRequest();
        request.setTitle("Hotel Deluxe");
        request.setAmount(550.0);

        ExpenseResponse response = ExpenseResponse.builder()
                .id(101L)
                .tripId(1L)
                .title("Hotel Deluxe")
                .amount(550.0)
                .category(ExpenseCategory.HOTEL)
                .build();

        when(expenseService.updateExpense(eq(1L), eq(101L), any(UpdateExpenseRequest.class), eq("testuser")))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/trips/1/expenses/101")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.title").value("Hotel Deluxe"))
                .andExpect(jsonPath("$.amount").value(550.0));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testDeleteExpenseSuccess() throws Exception {
        doNothing().when(expenseService).deleteExpense(1L, 100L, "testuser");

        mockMvc.perform(delete("/api/v1/trips/1/expenses/100")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
