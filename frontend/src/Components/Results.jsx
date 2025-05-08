import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';

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
    companyName,
    yearEnd,
    turnover,
    npat,
    totalLeviableAmount,
    totalMeasuredProcurementSpend,
    assessmentType,
  } = results;

  // Create a ref to the modal content for PDF generation
  const modalContentRef = useRef(null);

  const handleDownloadPDF = async () => {
    const element = modalContentRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);

      heightLeft -= pageHeight - 20;
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`B-BBEE_Score_Results_${sector}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Data for Bar Chart
  const barChartData = [
    {
      category: 'Ownership',
      Actual: ownershipScore.toFixed(2),
      Max: scorecard.ownership.weight,
    },
    {
      category: 'Management',
      Actual: managementControlScore.toFixed(2),
      Max: scorecard.managementControl.weight,
    },
    {
      category: 'Skills Dev',
      Actual: skillsDevelopmentScore.toFixed(2),
      Max: scorecard.skillsDevelopment.weight,
    },
    {
      category: 'ESD',
      Actual: esdScore.toFixed(2),
      Max: scorecard.esd.weight,
    },
    {
      category: 'Socio-Economic',
      Actual: socioEconomicDevelopmentScore.toFixed(2),
      Max: scorecard.socioEconomicDevelopment.weight,
    },
    ...(yesBonusPoints > 0
      ? [
          {
            category: 'YES Bonus',
            Actual: yesBonusPoints.toFixed(2),
            Max: scorecard.yesBonus.weight,
          },
        ]
      : []),
  ];

  // Data for Pie Chart
  const pieChartData = [
    {
      id: 'Ownership',
      label: 'Ownership',
      value: ownershipScore.toFixed(2),
      color: '#4CAF50',
    },
    {
      id: 'Management',
      label: 'Management',
      value: managementControlScore.toFixed(2),
      color: '#2196F3',
    },
    {
      id: 'Skills Dev',
      label: 'Skills Dev',
      value: skillsDevelopmentScore.toFixed(2),
      color: '#FFC107',
    },
    {
      id: 'ESD',
      label: 'ESD',
      value: esdScore.toFixed(2),
      color: '#F44336',
    },
    {
      id: 'Socio-Economic',
      label: 'Socio-Economic',
      value: socioEconomicDevelopmentScore.toFixed(2),
      color: '#9C27B0',
    },
    ...(yesBonusPoints > 0
      ? [
          {
            id: 'YES Bonus',
            label: 'YES Bonus',
            value: yesBonusPoints.toFixed(2),
            color: '#009688',
          },
        ]
      : []),
  ];

  // Data for Line Chart
  const lineChartData = [
    {
      id: 'Actual',
      color: '#4CAF50',
      data: [
        { x: 'Ownership', y: ownershipScore.toFixed(2) },
        { x: 'Management', y: managementControlScore.toFixed(2) },
        { x: 'Skills Dev', y: skillsDevelopmentScore.toFixed(2) },
        { x: 'ESD', y: esdScore.toFixed(2) },
        { x: 'Socio-Economic', y: socioEconomicDevelopmentScore.toFixed(2) },
        ...(yesBonusPoints > 0 ? [{ x: 'YES Bonus', y: yesBonusPoints.toFixed(2) }] : []),
      ],
    },
    {
      id: 'Max',
      color: '#B0BEC5',
      data: [
        { x: 'Ownership', y: scorecard.ownership.weight },
        { x: 'Management', y: scorecard.managementControl.weight },
        { x: 'Skills Dev', y: scorecard.skillsDevelopment.weight },
        { x: 'ESD', y: scorecard.esd.weight },
        { x: 'Socio-Economic', y: scorecard.socioEconomicDevelopment.weight },
        ...(yesBonusPoints > 0 ? [{ x: 'YES Bonus', y: scorecard.yesBonus.weight }] : []),
      ],
    },
  ];

  // Format currency for financial data
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div ref={modalContentRef}>
          <h2 className="text-2xl font-semibold mb-4">
            B-BBEE Score Results - {companyName} ({sector} Sector)
          </h2>
          <p className="text-lg mb-4">
            Financial Year End: {yearEnd || 'Not specified'} | Assessment Type: {assessmentType || 'New'}
          </p>

          {/* Company and Financial Summary */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Company Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Turnover:</strong> {formatCurrency(turnover)}</p>
              <p><strong>Net Profit After Tax (NPAT):</strong> {formatCurrency(npat)}</p>
              <p><strong>Total Leviable Amount:</strong> {formatCurrency(totalLeviableAmount)}</p>
              <p><strong>Total Procurement Spend:</strong> {formatCurrency(totalMeasuredProcurementSpend)}</p>
            </div>
          </div>

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
            {/* Bar Chart */}
            <div className="h-96 mb-4">
              <h4 className="text-md font-medium mb-2">Score Comparison (Bar)</h4>
              <ResponsiveBar
                data={barChartData}
                keys={['Actual', 'Max']}
                indexBy="category"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={['#4CAF50', '#B0BEC5']}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Category',
                  legendPosition: 'middle',
                  legendOffset: 32,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Score',
                  legendPosition: 'middle',
                  legendOffset: -40,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [{ on: 'hover', style: { itemOpacity: 1 } }],
                  },
                ]}
                role="application"
                ariaLabel="B-BBEE Score Breakdown Bar Chart"
              />
            </div>
            {/* Pie Chart */}
            <div className="h-96 mb-4">
              <h4 className="text-md font-medium mb-2">Score Distribution (Pie)</h4>
              <ResponsivePie
                data={pieChartData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                    effects: [{ on: 'hover', style: { itemTextColor: '#000' } }],
                  },
                ]}
                role="application"
                ariaLabel="B-BBEE Score Distribution Pie Chart"
              />
            </div>
            {/* Line Chart */}
            <div className="h-96 mb-4">
              <h4 className="text-md font-medium mb-2">Score Trends (Line)</h4>
              <ResponsiveLine
                data={lineChartData}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Category',
                  legendPosition: 'middle',
                  legendOffset: 36,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Score',
                  legendPosition: 'middle',
                  legendOffset: -40,
                }}
                colors={{ datum: 'color' }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={[
                  {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [{ on: 'hover', style: { itemBackground: 'rgba(0, 0, 0, .03)', itemOpacity: 1 } }],
                  },
                ]}
                role="application"
                ariaLabel="B-BBEE Score Trends Line Chart"
              />
            </div>
            {/* Score Breakdown List */}
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
                <li>
                  Increase black ownership to meet the sector target of {(scorecard.ownership.target * 100).toFixed(0)}%. 
                  Current ownership score is {ownershipScore.toFixed(2)}/{scorecard.ownership.weight}. 
                  Consider restructuring equity to include more black shareholders.
                </li>
              )}
              {managementControlScore < scorecard.managementControl.weight && (
                <li>
                  Enhance black representation in management to meet the sector target of {(scorecard.managementControl.target * 100).toFixed(0)}%. 
                  Current score is {managementControlScore.toFixed(2)}/{scorecard.managementControl.weight}. 
                  Promote or hire black individuals into senior management roles.
                </li>
              )}
              {skillsDevelopmentScore < scorecard.skillsDevelopment.weight && (
                <li>
                  Invest at least {formatCurrency(totalLeviableAmount * scorecard.skillsDevelopment.target)} in skills development to meet the sector target of {(scorecard.skillsDevelopment.target * 100).toFixed(0)}% of leviable amount. 
                  Current score is {skillsDevelopmentScore.toFixed(2)}/{scorecard.skillsDevelopment.weight}. 
                  Expand training programs for black employees.
                </li>
              )}
              {esdScore < scorecard.esd.weight && (
                <li>
                  Improve ESD by increasing procurement from black-owned suppliers to {formatCurrency(totalMeasuredProcurementSpend * scorecard.esd.targetSupplier)} (target: {(scorecard.esd.targetSupplier * 100).toFixed(0)}% of procurement spend) and enterprise development contributions to {formatCurrency(npat * scorecard.esd.targetEnterprise)} (target: {(scorecard.esd.targetEnterprise * 100).toFixed(0)}% of NPAT). 
                  Current score is {esdScore.toFixed(2)}/{scorecard.esd.weight}.
                </li>
              )}
              {socioEconomicDevelopmentScore < scorecard.socioEconomicDevelopment.weight && (
                <li>
                  Contribute at least {formatCurrency(npat * scorecard.socioEconomicDevelopment.target)} to socio-economic development to meet the sector target of {(scorecard.socioEconomicDevelopment.target * 100).toFixed(0)}% of NPAT. 
                  Current score is {socioEconomicDevelopmentScore.toFixed(2)}/{scorecard.socioEconomicDevelopment.weight}. 
                  Support community development initiatives.
                </li>
              )}
              {yesBonusPoints < scorecard.yesBonus.weight && (
                <li>
                  Increase participation in the YES 4 Youth Initiative to earn up to {scorecard.yesBonus.weight} bonus points. 
                  Current bonus points: {yesBonusPoints.toFixed(2)}. 
                  Engage more youth in employment programs.
                </li>
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