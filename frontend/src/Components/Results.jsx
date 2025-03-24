import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Results = ({ onClose, results }) => {
  const {
    sector,
    ownershipScore,
    managementControlScore,
    skillsDevelopmentScore,
    esdScore,
    socioEconomicDevelopmentScore,
    yesBonusPoints,
    totalScore,
    maxScore,
    bbeeLevel,
    bbeeStatus,
    scorecard,
  } = results;

  // Create a ref to the modal content for PDF generation
  const modalContentRef = useRef(null);

  const handleDownloadPDF = async () => {
    const element = modalContentRef.current;
    if (!element) return;

    try {
      // Use html2canvas to capture the modal content as an image
      const canvas = await html2canvas(element, {
        scale: 2, // Increase resolution for better quality
        useCORS: true, // Allow cross-origin images if any
        logging: false, // Disable logging for cleaner console
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190; // Width of the image in the PDF (A4 width - margins)
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10; // Start position from the top

      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);

      // Handle multi-page PDF if content is too long
      heightLeft -= pageHeight - 20; // Account for margins
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      // Download the PDF
      pdf.save(`B-BBEE_Score_Results_${sector}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        {/* Modal content wrapped in a ref */}
        <div ref={modalContentRef}>
          <h2 className="text-2xl font-semibold mb-4">B-BBEE Score Results ({sector} Sector)</h2>

          {/* Overall Score and Level */}
          <div className="mb-6 p-4 bg-blue-100 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Overall B-BBEE Score</h3>
            <p className="text-3xl font-bold">{totalScore.toFixed(2)} / {maxScore}</p>
            <p className="text-xl mt-2">
              B-BBEE Level: <span className="font-semibold">{bbeeLevel}</span>
            </p>
            <p className="text-lg">
              B-BBEE Recognition Status: <span className="font-semibold">{bbeeStatus}</span>
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Score Breakdown</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-medium">Ownership: {ownershipScore.toFixed(2)} / {scorecard.ownership.weight}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-medium">Management Control: {managementControlScore.toFixed(2)} / {scorecard.managementControl.weight}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-medium">Skills Development: {skillsDevelopmentScore.toFixed(2)} / {scorecard.skillsDevelopment.weight}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-medium">Enterprise and Supplier Development (ESD): {esdScore.toFixed(2)} / {scorecard.esd.weight}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-medium">Socio-Economic Development: {socioEconomicDevelopmentScore.toFixed(2)} / {scorecard.socioEconomicDevelopment.weight}</p>
              </div>
              {yesBonusPoints > 0 && (
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="font-medium">YES 4 Youth Bonus Points: {yesBonusPoints.toFixed(2)} / {scorecard.yesBonus.weight}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Recommendations to Improve Your Score</h3>
            <ul className="list-disc list-inside space-y-2">
              {ownershipScore < scorecard.ownership.weight && (
                <li>Increase black ownership to meet the sector target of {(scorecard.ownership.target * 100).toFixed(0)}%.</li>
              )}
              {managementControlScore < scorecard.managementControl.weight && (
                <li>Enhance black representation in management to meet the sector target of {(scorecard.managementControl.target * 100).toFixed(0)}%.</li>
              )}
              {skillsDevelopmentScore < scorecard.skillsDevelopment.weight && (
                <li>Invest more in skills development to meet the sector target of {(scorecard.skillsDevelopment.target * 100).toFixed(0)}% of leviable amount.</li>
              )}
              {esdScore < scorecard.esd.weight && (
                <li>
                  Improve Enterprise and Supplier Development by engaging more with black-owned suppliers (target: {(scorecard.esd.targetSupplier * 100).toFixed(0)}% of procurement spend) and increasing contributions to enterprise development (target: {(scorecard.esd.targetEnterprise * 100).toFixed(0)}% of NPAT).
                </li>
              )}
              {socioEconomicDevelopmentScore < scorecard.socioEconomicDevelopment.weight && (
                <li>Contribute more to socio-economic development to meet the sector target of {(scorecard.socioEconomicDevelopment.target * 100).toFixed(0)}% of NPAT.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;