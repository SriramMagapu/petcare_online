package com.example.petcare.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.example.petcare.entity.Appointment;
import com.example.petcare.entity.Pet;
import com.example.petcare.entity.VetProfile;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

@Service
public class PdfReportService {

    public byte[] generateAppointmentReport(
            Appointment appt,
            Pet pet,
            VetProfile vet) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4, 40, 40, 50, 40);
        PdfWriter.getInstance(document, out);
        document.open();

        /* ===================== FONTS ===================== */
        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(33, 150, 243));
        Font headerFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
        Font valueFont = new Font(Font.HELVETICA, 11);
        Font noteFont = new Font(Font.HELVETICA, 11);

        /* ===================== HEADER ===================== */
        Paragraph title = new Paragraph("Pet Medical Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        /* ===================== CLINIC INFO ===================== */
        PdfPTable clinicTable = new PdfPTable(2);
        clinicTable.setWidthPercentage(100);
        clinicTable.setWidths(new int[]{70, 30});

        PdfPCell clinicCell = new PdfPCell();
        clinicCell.setBorder(Rectangle.NO_BORDER);
        clinicCell.addElement(new Paragraph(vet.getClinicName(), headerFont));
        clinicCell.addElement(new Paragraph("Veterinarian: Dr. " + vet.getName(), valueFont));
        clinicTable.addCell(clinicCell);

        PdfPCell dateCell = new PdfPCell();
        dateCell.setBorder(Rectangle.NO_BORDER);
        dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        dateCell.addElement(new Paragraph(
                "Date: " + appt.getAppointmentDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                valueFont));
        dateCell.addElement(new Paragraph("Slot: " + appt.getSlot(), valueFont));
        clinicTable.addCell(dateCell);

        clinicTable.setSpacingAfter(15);
        document.add(clinicTable);

        /* ===================== PET DETAILS ===================== */
        document.add(sectionHeader("Pet Details"));

        PdfPTable petTable = createTable();
        petTable.addCell(labelCell("Pet Name"));
        petTable.addCell(valueCell(pet.getName()));
        petTable.addCell(labelCell("Species"));
        petTable.addCell(valueCell(pet.getSpecies()));
        document.add(petTable);

        /* ===================== APPOINTMENT DETAILS ===================== */
        document.add(sectionHeader("Appointment Details"));

        PdfPTable apptTable = createTable();
        apptTable.addCell(labelCell("Veterinarian"));
        apptTable.addCell(valueCell("Dr. " + vet.getName()));
        apptTable.addCell(labelCell("Clinic"));
        apptTable.addCell(valueCell(vet.getClinicName()));
        document.add(apptTable);

        /* ===================== DIAGNOSIS ===================== */
        document.add(sectionHeader("Diagnosis / Vet Notes"));

        PdfPTable notesTable = new PdfPTable(1);
        notesTable.setWidthPercentage(100);

        PdfPCell notesCell = new PdfPCell(new Paragraph(
                appt.getVetNotes() != null ? appt.getVetNotes() : "No notes provided.",
                noteFont));
        notesCell.setPadding(10);
        notesCell.setBorderColor(Color.GRAY);

        notesTable.addCell(notesCell);
        document.add(notesTable);

        /* ===================== FOOTER ===================== */
        document.add(Chunk.NEWLINE);
        Paragraph footer = new Paragraph(
                "This report is system generated and does not require a signature.",
                new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    /* ===================== HELPERS ===================== */

    private Paragraph sectionHeader(String text) {
        Font font = new Font(Font.HELVETICA, 13, Font.BOLD);
        Paragraph p = new Paragraph(text, font);
        p.setSpacingBefore(15);
        p.setSpacingAfter(8);
        return p;
    }

    private PdfPTable createTable() throws Exception {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new int[]{30, 70});
        table.setSpacingAfter(10);
        return table;
    }

    private PdfPCell labelCell(String text) {
        Font font = new Font(Font.HELVETICA, 11, Font.BOLD);
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(8);
        cell.setBackgroundColor(new Color(245, 247, 250));
        return cell;
    }

    private PdfPCell valueCell(String text) {
        Font font = new Font(Font.HELVETICA, 11);
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(8);
        return cell;
    }
}
