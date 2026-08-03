package com.tripnest.trip.controller;

import com.tripnest.security.jwt.JwtAuthenticationFilter;
import com.tripnest.trip.dto.DocumentResponse;
import com.tripnest.trip.entity.DocumentCategory;
import com.tripnest.trip.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DocumentController.class)
@AutoConfigureMockMvc(addFilters = false)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DocumentService documentService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private DocumentResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockResponse = DocumentResponse.builder()
                .id(1L)
                .name("Passport Scan.pdf")
                .fileUrl("/uploads/travel_document/passport.pdf")
                .fileType("application/pdf")
                .fileSize(1024L)
                .category(DocumentCategory.TRAVEL_DOCUMENT)
                .uploadedAt(LocalDateTime.now())
                .tripId(10L)
                .tripName("Paris Trip")
                .build();
    }

    @Test
    void uploadDocument_ShouldReturn201Created() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "passport.pdf",
                "application/pdf",
                "dummy content".getBytes()
        );

        when(documentService.uploadDocument(eq(10L), eq(DocumentCategory.TRAVEL_DOCUMENT), any(), any()))
                .thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("tripId", "10")
                        .param("category", "TRAVEL_DOCUMENT")
                        .param("name", "Passport Scan.pdf"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Passport Scan.pdf"));
    }

    @Test
    void getDocuments_ShouldReturnDocumentList() throws Exception {
        when(documentService.getDocuments(eq(10L), eq(DocumentCategory.TRAVEL_DOCUMENT)))
                .thenReturn(Arrays.asList(mockResponse));

        mockMvc.perform(get("/api/v1/documents")
                        .param("tripId", "10")
                        .param("category", "TRAVEL_DOCUMENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    void deleteDocument_ShouldReturn200Ok() throws Exception {
        doNothing().when(documentService).deleteDocument(1L);

        mockMvc.perform(delete("/api/v1/documents/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
