import React, { useContext } from 'react';
// import * as Mui from '@mui/material';
import JSBridge from '@nativeBridge/jsbridge';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import AppContext from '@root/AppContext.jsx';
import moment from 'moment';
import DownloadIcon from '@mui/icons-material/Download';
import AgeingChart from '@components/Charts/AgeingChart';
import RevenueChart from '@components/Charts/RevenueChart';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import CollectionDSOChart from '@components/Charts/CollectionDSOChart';
import css from '../Dashboard/Dashboard.scss';
import PopperComp from '../../../components/Popper/PopperComp';

const Reports = ({ id, date }) => {
  const { organization, user } = useContext(AppContext);
  const [value, setValue] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const device = localStorage.getItem('device_detect');
  const [chartRef, setChartRef] = React.useState({
    dpo: null,
    dso: null,
    ageing: null,
    revenueVsCollection: null,
  });

  const ageingLables = [
    'Not due',
    '1 to 30',
    '31 to 60',
    '61 to 120',
    'Above 360',
    'Advance',
  ];

  const barValue = {
    // labels: value?.total_receivables?.map((val) => val?.age_bucket) || [],
    // data: value?.total_receivables?.map((val) => val?.outstanding),
    labels: ageingLables,
    data:
      ageingLables.map(
        (data) =>
          value?.total_receivables?.find((val) => val?.age_bucket === data)
            ?.outstanding || 0
      ) || [],
  };
  const collectionLine = {
    labels: value?.collection_effectiveness?.labels
      ? value?.collection_effectiveness?.labels?.map((n) =>
          moment(n).format('MMM YY')
        )
      : [],
    datasets: [
      {
        // label: 'Cashburn',
        data: value?.collection_effectiveness?.collections || [],
        fill: true,
        // lineTension: 1,
        backgroundColor: 'rgb(133 92 248 / 27%)',
        borderColor: 'rgb(133 92 248)',
      },
    ],
    // data: value?.collection_effectiveness?.collections || [],
  };
  const DSOLine = {
    labels: value?.dso_trend ? Object.keys(value?.dso_trend) : [],
    datasets: [
      {
        // label: "First dataset",
        data: (value?.dso_trend && Object?.values(value?.dso_trend)) || [],
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        lineTension: 0.5,
      },
    ],
    // data: value?.dso_trend ? Object.values(value?.dso_trend) : [],
  };

  const downloadChartAsPng = () => {
    const zip = new JSZip();
    const promises = [];

    [
      'Rece_Ageing',
      'Rece_RevenueVsTarget',
      'Rece_Collection',
      'Rece_DSO',
    ].forEach((div) => {
      const element = document.getElementById(div);
      const promise = html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        zip.file(`${div}.png`, imgData.substr(imgData.indexOf(',') + 1), {
          base64: true,
        });
      });
      promises.push(promise);
    });

    function getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    }

    Promise.all(promises).then(() => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        if (device === 'desktop') {
          saveAs(content, 'Recevables.zip');
        } else {
          getBase64(content).then((data) =>
            JSBridge.downloadBase64(data, 'application/zip', 'Recevables.zip')
          );
        }
      });
    });
  };

  const downloadChartAsPdf = () => {
    // create a new jsPDF instance
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // get the chart canvas elements
    const chart1Canvas = chartRef?.revenueVsCollection.current.canvas;
    const chart2Canvas = chartRef?.ageing.current.canvas;
    const chart3Canvas = chartRef?.dpo.current.canvas;
    const chart4Canvas = chartRef?.dso.current.canvas;

    // create new Image objects from the chart canvases
    const chart1Image = chart1Canvas.toDataURL('image/png', 1.0);
    const chart2Image = chart2Canvas.toDataURL('image/png', 1.0);
    const chart3Image = chart3Canvas.toDataURL('image/png', 1.0);
    const chart4Image = chart4Canvas.toDataURL('image/png', 1.0);

    // add the chart images to the PDF document
    doc.addImage(chart1Image, 'PNG', 10, 10, 100, 75);
    doc.addImage(chart2Image, 'PNG', 110, 10, 90, 75);
    doc.addImage(chart3Image, 'PNG', 10, 100, 140, 75);
    doc.addImage(chart4Image, 'PNG', 10, 200, 140, 75);

    function getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    }

    // save the PDF document
    if (device === 'desktop') {
      doc.save('receivables-chart.pdf');
    } else {
      getBase64(doc).then((data) =>
        JSBridge.downloadBase64(
          data,
          'application/pdf',
          'receivables-chart.pdf'
        )
      );
    }
  };

  React.useEffect(() => {
    RestApi(
      `organizations/${
        organization.orgId
      }/receivables/dashboard/${id}?date=${moment(date).format('YYYY-MM-DD')}`,
      {
        method: METHOD.GET,
        headers: {
          authorization: `Bearer ${user.activeToken}`,
        },
      }
    ).then((res) => {
      setValue(res);
    });
  }, [id]);

  return (
    <div style={{ width: '100%', marginBottom: 5 }}>
      <div
        className={css.newDownloadReport}
        style={{
          width: device === 'mobile' ? '88%' : '98%',
          margin: device === 'mobile' ? '16px 6% 0' : '0 0 10px 0',
        }}
      >
        <div
          className={css.innerDiv}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <DownloadIcon sx={{ color: '#fff' }} />
          <p className={css.innerP}>Download Reports</p>
        </div>
      </div>
      <div
        className={device === 'mobile' ? css.SecondContNewChart : css.mainRece}
      >
        <div className={css.firstRow}>
          {device === 'desktop' && (
            <div className={css.card1} id="Rece_RevenueVsTarget">
              <RevenueChart
                labels={value?.revenue_vs_collection?.labels || []}
                data={value?.revenue_vs_collection?.datasets || []}
                heightProps="60"
                setChartRef={(ref) =>
                  setChartRef((prev) => ({ ...prev, revenueVsCollection: ref }))
                }
              />
            </div>
          )}
          <div className={css.card2} id="Rece_Ageing">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '0 1rem',
              }}
            >
              <p className={css.graphTitle}>Ageing</p>
            </div>

            <AgeingChart
              labels={barValue?.labels}
              data={barValue?.data}
              heightProps={device === 'mobile' ? 280 : 350}
              setChartRef={(ref) =>
                setChartRef((prev) => ({ ...prev, ageing: ref }))
              }
            />
          </div>
        </div>

        {device === 'desktop' && (
          <div className={css.secondRow}>
            {device === 'mobile' && (
              <div className={css.card1} id="Rece_RevenueVsTarget">
                <RevenueChart
                  labels={
                    (value?.revenue_vs_collection?.labels?.length > 0 &&
                      value?.revenue_vs_collection?.labels?.map((n) =>
                        moment(n).format('MMM YY')
                      )) ||
                    []
                  }
                  data={value?.revenue_vs_collection?.datasets || []}
                  heightProps="90"
                  setChartRef={(ref) =>
                    setChartRef((prev) => ({
                      ...prev,
                      revenueVsCollection: ref,
                    }))
                  }
                />
              </div>
            )}
            <div className={css.card3} id="Rece_Collection">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 1rem',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <p className={css.graphTitle}>Collection Effectiveness</p>
                </div>
              </div>

              <CollectionDSOChart
                dataLine={collectionLine}
                heightProps={device === 'mobile' ? '240px' : '190px'}
                setChartRef={(ref) =>
                  setChartRef((prev) => ({ ...prev, dpo: ref }))
                }
              />
            </div>
            <div className={css.card4} id="Rece_DSO">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 1rem',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <p className={css.graphTitle}>DSO Trend</p>
                </div>
              </div>

              <CollectionDSOChart
                dataLine={DSOLine}
                heightProps={device === 'mobile' ? '240px' : '190px'}
                setChartRef={(ref) =>
                  setChartRef((prev) => ({ ...prev, dso: ref }))
                }
              />
            </div>
          </div>
        )}

        {device === 'mobile' && (
          <Carousel>
            {device === 'mobile' && (
              <div className={css.card1} id="Rece_RevenueVsTarget">
                <RevenueChart
                  labels={
                    (value?.revenue_vs_collection?.labels?.length > 0 &&
                      value?.revenue_vs_collection?.labels?.map((n) =>
                        moment(n).format('MMM YY')
                      )) ||
                    []
                  }
                  data={value?.revenue_vs_collection?.datasets || []}
                  heightProps="90"
                  setChartRef={(ref) =>
                    setChartRef((prev) => ({
                      ...prev,
                      revenueVsCollection: ref,
                    }))
                  }
                />
              </div>
            )}
            <div className={css.card3} id="Rece_Collection">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 1rem',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <p className={css.graphTitle}>Collection Effectiveness</p>
                </div>
              </div>

              <CollectionDSOChart
                dataLine={collectionLine}
                heightProps={device === 'mobile' ? '240px' : '190px'}
                setChartRef={(ref) =>
                  setChartRef((prev) => ({ ...prev, dpo: ref }))
                }
              />
            </div>
            <div className={css.card4} id="Rece_DSO">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 1rem',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <p className={css.graphTitle}>DSO Trend</p>
                </div>
              </div>

              <CollectionDSOChart
                dataLine={DSOLine}
                heightProps={device === 'mobile' ? '240px' : '190px'}
                setChartRef={(ref) =>
                  setChartRef((prev) => ({ ...prev, dso: ref }))
                }
              />
            </div>
          </Carousel>
        )}
      </div>
      <PopperComp
        openProps={Boolean(anchorEl)}
        anchorElProps={anchorEl}
        onClose={() => {
          setAnchorEl(null);
        }}
        popperStyle={{
          maxHeight: '50vh',
          width: device === 'mobile' ? '52vw' : '12.5rem',
          background: '#fff',
          borderRadius: '8px',
          marginTop: '10px',
        }}
      >
        <div>
          {['PNG', 'PDF', 'XLSX'].map((val) => (
            <div>
              <div
                className={css.innerDivPopper}
                onClick={() => {
                  if (val === 'PNG') {
                    // [
                    //   'Rece_Ageing',
                    //   'Rece_RevenueVsTarget',
                    //   'Rece_Collection',
                    //   'Rece_DSO',
                    // ].map((chart) => downloadChartAsPng(chart, `${chart}.png`));
                    downloadChartAsPng();
                  } else if (val === 'PDF') {
                    downloadChartAsPdf();
                  }
                  setAnchorEl(null);
                }}
              >
                <DownloadIcon />
                <p className={css.innerP}>Download {val}</p>
              </div>
            </div>
          ))}
        </div>
      </PopperComp>
    </div>
  );
};

export default Reports;
