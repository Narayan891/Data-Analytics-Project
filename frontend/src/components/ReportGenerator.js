import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FileText, Download, PieChart, Shield, CheckCircle } from 'lucide-react';
import './ReportGenerator.css';

const ReportGenerator = ({ targetId, projectName = "Wildlife Intelligence Report" }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    const input = document.getElementById(targetId);
    if (!input) {
      console.error(`Target ID ${targetId} not found`);
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617', // Match obsidian theme
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add report header in PDF (optional, but let's keep it simple with the screenshot)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      pdf.save(`${projectName.replace(/\s+/g, '_')}_${timestamp}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="report-generator-container">
      <button 
        className={`btn-report ${isGenerating ? 'loading' : ''}`} 
        onClick={generatePDF}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <div className="report-loader" />
        ) : (
          <>
            <FileText size={18} />
            <span>Generate Tactical Intelligence Report</span>
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className="generation-status">
          <Shield size={14} className="status-icon pulse" />
          <span>Synthesizing Encrypted PDF Matrix...</span>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
