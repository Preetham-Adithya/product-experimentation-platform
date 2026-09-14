import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import './App.css'

function CursorGlow() {
  useEffect(() => {
    const handleMouseMove = (event) => {
      document.documentElement.style.setProperty(
        '--mouse-x',
        `${event.clientX}px`
      )

      document.documentElement.style.setProperty(
        '--mouse-y',
        `${event.clientY}px`
      )
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return <div className="cursor-glow" />
}

function App() {
    function simulateConversions(numberOfUsers, conversionRate) {
    let conversions = 0

    for (let i = 0; i < numberOfUsers; i++) {
      const randomNumber = Math.random()

      if (randomNumber < conversionRate / 100) {
        conversions++
      }
    }

    return conversions
  }
  const [users, setUsers] = useState(50000)
  const [conversionA, setConversionA] = useState(4.2)
  const [conversionB, setConversionB] = useState(5.1)
  const [aov, setAov] = useState(2500)
  const [returnRateA, setReturnRateA] = useState(12)
  const [returnRateB, setReturnRateB] = useState(16)

  const [cancelRateA, setCancelRateA] = useState(5)
  const [cancelRateB, setCancelRateB] = useState(7)
  const [result, setResult] = useState(null)
  const [experimentHistory, setExperimentHistory] = useState([])

  function runExperiment() {
    const totalUsers = Number(users)
    const rateA = Number(conversionA)
    const rateB = Number(conversionB)
    const averageOrderValue = Number(aov)

    const usersA = Math.floor(totalUsers / 2)
    const usersB = totalUsers - usersA

    // Funnel calculations

    const productViewsA = simulateConversions(usersA, 80)
    const productViewsB = simulateConversions(usersB, 82)

    const addToBagA = simulateConversions(productViewsA, 25)
    const addToBagB = simulateConversions(productViewsB, 27)

    const checkoutA = simulateConversions(addToBagA, 50)
    const checkoutB = simulateConversions(addToBagB, 54)

    const ordersA = simulateConversions(checkoutA, 42)
    const ordersB = simulateConversions(checkoutB, 42)

    // Overall conversion rate

    const observedRateA = (ordersA / usersA) * 100
    const observedRateB = (ordersB / usersB) * 100

    // Revenue

    const revenueA = ordersA * averageOrderValue
    const revenueB = ordersB * averageOrderValue

    // Guardrail metrics

    const returnsA = Math.round(
      ordersA * (Number(returnRateA) / 100)
    )

    const returnsB = Math.round(
      ordersB * (Number(returnRateB) / 100)
    )

    const cancellationsA = Math.round(
      ordersA * (Number(cancelRateA) / 100)
    )

    const cancellationsB = Math.round(
      ordersB * (Number(cancelRateB) / 100)
    )

    const returnRateDifference =
      Number(returnRateB) - Number(returnRateA)

    const cancelRateDifference =
      Number(cancelRateB) - Number(cancelRateA)

    // Business impact

    const additionalOrders = ordersB - ordersA

    const additionalRevenue = revenueB - revenueA

    const revenueUplift =
      revenueA > 0
        ? ((revenueB - revenueA) / revenueA) * 100
        : 0

    // Funnel conversion rates

    const viewRateA = (productViewsA / usersA) * 100
    const viewRateB = (productViewsB / usersB) * 100

    const addToBagRateA =
      (addToBagA / productViewsA) * 100

    const addToBagRateB =
      (addToBagB / productViewsB) * 100

    const checkoutRateA =
      (checkoutA / addToBagA) * 100

    const checkoutRateB =
      (checkoutB / addToBagB) * 100

    const purchaseRateA =
      (ordersA / checkoutA) * 100

    const purchaseRateB =
      (ordersB / checkoutB) * 100

    const conversionChartData = [
      {
        name: 'Variant A',
        conversion: Number(observedRateA.toFixed(2)),
      },
      {
        name: 'Variant B',
        conversion: Number(observedRateB.toFixed(2)),
      },
    ]

    const uplift =
      observedRateA > 0
        ? ((observedRateB - observedRateA) / observedRateA) * 100
        : 0


    // 👇 INSERT THE NEW STATISTICAL CODE HERE

    const pA = ordersA / usersA
    const pB = ordersB / usersB

    const pooledRate =
      (ordersA + ordersB) / (usersA + usersB)

    const standardError = Math.sqrt(
      pooledRate *
        (1 - pooledRate) *
        (1 / usersA + 1 / usersB)
    )

    const zScore =
      standardError > 0
        ? (pB - pA) / standardError
        : 0

    const erf = (x) => {
      const sign = x >= 0 ? 1 : -1
      x = Math.abs(x)

      const a1 = 0.254829592
      const a2 = -0.284496736
      const a3 = 1.421413741
      const a4 = -1.453152027
      const a5 = 1.061405429
      const p = 0.3275911

      const t = 1 / (1 + p * x)

      const y =
        1 -
        (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
          t *
          Math.exp(-x * x))

      return sign * y
    }

    const normalCDF = (z) => {
      return 0.5 * (1 + erf(z / Math.sqrt(2)))
    }

    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))

    const statisticallySignificant = pValue < 0.05
    // 95% Confidence Intervals

    const zCritical = 1.96

    const standardErrorA = Math.sqrt(
      (pA * (1 - pA)) / usersA
    )

    const standardErrorB = Math.sqrt(
      (pB * (1 - pB)) / usersB
    )

    const marginOfErrorA = zCritical * standardErrorA
    const marginOfErrorB = zCritical * standardErrorB

    const confidenceIntervalA = {
      lower: (pA - marginOfErrorA) * 100,
      upper: (pA + marginOfErrorA) * 100,
    }

    const confidenceIntervalB = {
      lower: (pB - marginOfErrorB) * 100,
      upper: (pB + marginOfErrorB) * 100,
    }
    let pmDecision
    let decisionReason

    if (!statisticallySignificant) {
      pmDecision = 'CONTINUE EXPERIMENT'
      decisionReason =
        'The result is not statistically significant. Collect more data before making a rollout decision.'
    } else if (
      observedRateB > observedRateA &&
      Number(returnRateB) <= Number(returnRateA) &&
      Number(cancelRateB) <= Number(cancelRateA)
    ) {
      pmDecision = 'ROLL OUT VARIANT B'
      decisionReason =
        'Variant B improves conversion without worsening the guardrail metrics.'
    } else if (
      observedRateB > observedRateA &&
      (
        Number(returnRateB) > Number(returnRateA) ||
        Number(cancelRateB) > Number(cancelRateA)
      )
    ) {
      pmDecision = 'INVESTIGATE VARIANT B'
      decisionReason =
        'Variant B improves conversion, but one or more guardrail metrics have worsened.'
    } else {
      pmDecision = 'DO NOT ROLL OUT'
      decisionReason =
        'Variant B does not provide a statistically significant improvement over Variant A.'
    }
    // PM Insights

    const conversionInsight =
      observedRateB > observedRateA
        ? `Variant B improves conversion by ${uplift.toFixed(2)}% compared with Variant A.`
        : observedRateA > observedRateB
        ? `Variant A performs better than Variant B by ${Math.abs(uplift).toFixed(2)}%.`
        : 'Both variants have the same observed conversion rate.'

    const revenueInsight =
      additionalRevenue > 0
        ? `Variant B generated an estimated ₹${additionalRevenue.toLocaleString()} in additional revenue.`
        : additionalRevenue < 0
        ? `Variant B generated ₹${Math.abs(additionalRevenue).toLocaleString()} less revenue than Variant A.`
        : 'Both variants generated the same estimated revenue.'

    const guardrailInsight =
      returnRateDifference > 0 || cancelRateDifference > 0
        ? `Variant B improves conversion, but guardrail metrics worsened. Return rate changed by ${returnRateDifference.toFixed(1)} percentage points and cancellation rate changed by ${cancelRateDifference.toFixed(1)} percentage points.`
        : 'Variant B improves conversion without worsening the defined guardrail metrics.'

    let nextExperiment

    if (pmDecision === 'INVESTIGATE VARIANT B') {
      nextExperiment =
        'Investigate the causes of increased returns and cancellations before considering a full rollout.'
    } else if (pmDecision === 'ROLL OUT VARIANT B') {
      nextExperiment =
        'Roll out Variant B gradually and continue monitoring conversion and guardrail metrics.'
    } else if (pmDecision === 'CONTINUE EXPERIMENT') {
      nextExperiment =
        'Continue collecting experiment data until the result reaches statistical significance.'
    } else {
      nextExperiment =
        'Do not roll out Variant B. Consider testing a different product experience.'
    }

    setResult({
      usersA,
      usersB,
      ordersA,
      ordersB,
      conversionInsight,
      revenueInsight,
      guardrailInsight,
      nextExperiment,
      observedRateA,
      observedRateB,
      revenueA,
      revenueB,
      additionalOrders,
      additionalRevenue,
      revenueUplift,
      returnRateA: Number(returnRateA),
      returnRateB: Number(returnRateB),
      returnsA,
      returnsB,

      cancelRateA: Number(cancelRateA),
      cancelRateB: Number(cancelRateB),
      cancellationsA,
      cancellationsB,

      returnRateDifference,
      cancelRateDifference,
      uplift,

      productViewsA,
      productViewsB,
      addToBagA,
      addToBagB,
      checkoutA,
      checkoutB,
      viewRateA,
      viewRateB,
      addToBagRateA,
      addToBagRateB,
      checkoutRateA,
      checkoutRateB,
      purchaseRateA,
      purchaseRateB,

      winner:
        observedRateB > observedRateA
          ? 'Variant B'
          : observedRateA > observedRateB
          ? 'Variant A'
          : 'Tie',

      pValue,
      statisticallySignificant,

      confidenceIntervalA,
      confidenceIntervalB,

      pmDecision,
      decisionReason,
    })
    setExperimentHistory((previousHistory) => [
      ...previousHistory,
      {
        id: Date.now(),
        date: new Date().toLocaleString(),
        winner:
          observedRateB > observedRateA
            ? 'Variant B'
            : observedRateA > observedRateB
            ? 'Variant A'
            : 'Tie',
        conversionA: observedRateA,
        conversionB: observedRateB,
        uplift: uplift,
        pValue: pValue,
        statisticallySignificant: statisticallySignificant,
        additionalRevenue: additionalRevenue,
        pmDecision: pmDecision,
      },
    ])
  }

  return(
    <>
      <CursorGlow />
    <div className="app">
      <header className="header">
        <div>
          <span className="badge">PM PORTFOLIO PROJECT</span>
          <h1>Product Experimentation Platform</h1>
          <p>
            Create an A/B test, compare product variants and measure
            their potential business impact.
          </p>
          <div className="product-status">
            <span className="status-dot"></span>
            Experiment engine ready
            <span className="status-divider">•</span>
            A/B Analytics
            <span className="status-divider">•</span>
            PM Decision Engine
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="card">
          <h2>Create Experiment</h2>

          <div className="form-grid">
            <div className="input-group">
              <label>Experiment</label>
              <select>
                <option>Product Page CTA</option>
                <option>Checkout Experience</option>
                <option>Recommendation Widget</option>
                <option>Homepage Banner</option>
              </select>
            </div>

            <div className="input-group">
              <label>Total Users</label>
              <input
                type="number"
                value={users}
                min="100"
                onChange={(e) => setUsers(e.target.value)}
              />
            </div>

            <div className="variant variant-a">
              <span className="variant-label">VARIANT A</span>

              <div className="input-group">
                <label>CTA</label>
                <input type="text" defaultValue="Add to Bag" />
              </div>

              <div className="input-group">
                <label>Expected Conversion Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={conversionA}
                  onChange={(e) => setConversionA(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Return Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={returnRateA}
                  onChange={(e) => setReturnRateA(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Cancellation Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cancelRateA}
                  onChange={(e) => setCancelRateA(e.target.value)}
                />
              </div>
            </div>

            <div className="variant variant-b">
              <span className="variant-label">VARIANT B</span>

              <div className="input-group">
                <label>CTA</label>
                <input type="text" defaultValue="Buy Now" />
              </div>

              <div className="input-group">
                <label>Expected Conversion Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={conversionB}
                  onChange={(e) => setConversionB(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Return Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={returnRateB}
                  onChange={(e) => setReturnRateB(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Cancellation Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cancelRateB}
                  onChange={(e) => setCancelRateB(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Average Order Value (₹)</label>
              <input
                type="number"
                value={aov}
                onChange={(e) => setAov(e.target.value)}
              />
            </div>
          </div>

          <button className="run-button" onClick={runExperiment}>
            Run Experiment
          </button>
        </section>

        {result && (
          <section className="results">
            <div className="result-header">
              <div>
                <span className="badge">EXPERIMENT RESULT</span>
                <h2>{result.winner} is winning</h2>
              </div>

              <div className="uplift">
                <span>Conversion uplift</span>
                <strong>
                  {result.uplift >= 0 ? '+' : ''}
                  {result.uplift.toFixed(1)}%
                </strong>
              </div>
            </div>

            <div className="metric-grid">
              <div className="metric-card">
                <span>Variant A Users</span>
                <strong>{result.usersA.toLocaleString()}</strong>
              </div>

              <div className="metric-card">
                <span>Variant B Users</span>
                <strong>{result.usersB.toLocaleString()}</strong>
              </div>

              <div className="metric-card">
                <span>Variant A Conversion</span>
                <strong>{result.observedRateA.toFixed(2)}%</strong>
              </div>

              <div className="metric-card">
                <span>Variant B Conversion</span>
                <strong>{result.observedRateB.toFixed(2)}%</strong>
              </div>
            </div>

            <div className="comparison">
              <div>
                <span>Variant A Revenue</span>
                <strong>
                  ₹{result.revenueA.toLocaleString('en-IN')}
                </strong>
              </div>

              <div>
                <span>Variant B Revenue</span>
                <strong>
                  ₹{result.revenueB.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <span className="badge">CONVERSION COMPARISON</span>
                  <h3>Which variant converts better?</h3>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Variant A',
                        conversion: Number(result.observedRateA.toFixed(2)),
                      },
                      {
                        name: 'Variant B',
                        conversion: Number(result.observedRateB.toFixed(2)),
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      domain={[0, 'auto']}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Conversion']}
                    />
                    <Bar
                      dataKey="conversion"
                      name="Conversion Rate"
                      fill="#ec4899"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <span className="badge">FUNNEL PERFORMANCE</span>
                  <h3>Where does Variant B gain users?</h3>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={[
                      {
                        name: 'Product Views',
                        'Variant A': result.viewRateA,
                        'Variant B': result.viewRateB,
                      },
                      {
                        name: 'Add to Bag',
                        'Variant A': result.addToBagRateA,
                        'Variant B': result.addToBagRateB,
                      },
                      {
                        name: 'Checkout',
                        'Variant A': result.checkoutRateA,
                        'Variant B': result.checkoutRateB,
                      },
                      {
                        name: 'Purchase',
                        'Variant A': result.purchaseRateA,
                        'Variant B': result.purchaseRateB,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${Number(value).toFixed(1)}%`,
                        'Conversion',
                      ]}
                    />

                    <Legend />

                    <Bar
                      dataKey="Variant A"
                      name="Variant A"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />

                    <Bar
                      dataKey="Variant B"
                      name="Variant B"
                      fill="#ec4899"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-section">
              <div className="chart-header">
                <div>
                  <span className="badge">REVENUE COMPARISON</span>
                  <h3>What is the business impact?</h3>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Revenue',
                        'Variant A': result.revenueA,
                        'Variant B': result.revenueB,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis
                      tickFormatter={(value) =>
                        `₹${(value / 100000).toFixed(0)}L`
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString('en-IN')}`,
                        'Revenue',
                      ]}
                    />

                    <Legend />

                    <Bar
                      dataKey="Variant A"
                      name="Variant A"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />

                    <Bar
                      dataKey="Variant B"
                      name="Variant B"
                      fill="#22d3ee"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="impact">
              <div className="impact-header">
                <div>
                  <span className="badge">BUSINESS IMPACT</span>
                  <h3>What does the experiment mean for the business?</h3>
                </div>
              </div>

              <div className="impact-grid">

                <div className="impact-card">
                  <span>Additional Orders</span>
                  <strong>
                    +{result.additionalOrders.toLocaleString('en-IN')}
                  </strong>
                  <small>
                    orders from Variant B
                  </small>
                </div>

                <div className="impact-card">
                  <span>Additional Revenue</span>
                  <strong>
                    +₹{result.additionalRevenue.toLocaleString('en-IN')}
                  </strong>
                  <small>
                    incremental revenue
                  </small>
                </div>

                <div className="impact-card highlight">
                  <span>Revenue Uplift</span>
                  <strong>
                    +{result.revenueUplift.toFixed(1)}%
                  </strong>
                  <small>
                    compared with Variant A
                  </small>
                </div>
              </div>
            </div>
          
            {/* PM INSIGHTS */}
            <div className="pm-insights">
              <div className="pm-insights-header">
                <span className="badge">PM INSIGHTS</span>
                <h3>What should a Product Manager do next?</h3>
              </div>

              <div className="insight-grid">

                <div className="insight-card">
                  <h4>📈 Conversion Insight</h4>
                  <p>{result.conversionInsight}</p>
                </div>

                <div className="insight-card">
                  <h4>💰 Revenue Insight</h4>
                  <p>{result.revenueInsight}</p>
                </div>

                <div className="insight-card">
                  <h4>⚠️ Guardrail Insight</h4>
                  <p>{result.guardrailInsight}</p>
                </div>

                <div className="insight-card">
                  <h4>🎯 Recommended Next Step</h4>
                  <p>{result.nextExperiment}</p>
                </div>

              </div>

              <div className="key-product-insight">
                <h4>Key Product Insight</h4>

                <p>
                  {result.pmDecision === 'INVESTIGATE VARIANT B'
                    ? 'Variant B shows promising conversion improvement, but the deterioration in guardrail metrics creates a potential downstream customer-experience risk.'
                    : result.pmDecision === 'ROLL OUT VARIANT B'
                    ? 'Variant B provides a statistically significant improvement without worsening the defined guardrail metrics, making it a strong candidate for rollout.'
                    : result.pmDecision === 'CONTINUE EXPERIMENT'
                    ? 'The current evidence is not strong enough to make a rollout decision. More experiment data is required.'
                    : 'Variant B does not currently provide enough evidence to justify a rollout.'}
                </p>
              </div>
            </div>

            <div className="guardrails">
              <div className="guardrail-header">
                <span className="badge">GUARDRAIL METRICS</span>
                <h3>Are we improving the product safely?</h3>
              </div>

              <div className="guardrail-grid">

                <div className="guardrail-card">
                  <span>Return Rate</span>

                  <div className="guardrail-values">
                    <div>
                      <small>Variant A</small>
                      <strong>{result.returnRateA.toFixed(1)}%</strong>
                    </div>

                    <div>
                      <small>Variant B</small>
                      <strong>{result.returnRateB.toFixed(1)}%</strong>
                    </div>
                  </div>

                  <p className={
                    result.returnRateDifference > 0
                      ? 'warning'
                      : 'healthy'
                  }>
                    {result.returnRateDifference > 0
                      ? `↑ ${result.returnRateDifference.toFixed(1)} percentage points`
                      : '✓ No increase'}
                  </p>
                </div>


                <div className="guardrail-card">
                  <span>Cancellation Rate</span>

                  <div className="guardrail-values">
                    <div>
                      <small>Variant A</small>
                      <strong>{result.cancelRateA.toFixed(1)}%</strong>
                    </div>

                    <div>
                      <small>Variant B</small>
                      <strong>{result.cancelRateB.toFixed(1)}%</strong>
                    </div>
                  </div>

                  <p className={
                    result.cancelRateDifference > 0
                      ? 'warning'
                      : 'healthy'
                  }>
                    {result.cancelRateDifference > 0
                      ? `↑ ${result.cancelRateDifference.toFixed(1)} percentage points`
                      : '✓ No increase'}
                  </p>
                </div>

              </div>
            </div>
            <div className="decision">
              <span className="badge">PM DECISION</span>

              <h2>{result.pmDecision}</h2>

              <p>{result.decisionReason}</p>

              <div className="decision-meta">
                Based on conversion, statistical significance, revenue impact,
                and guardrail performance.
              </div>
            </div>
            <div className="funnel">
              <div className="funnel-header">
                <div>
                  <span className="badge">CONVERSION FUNNEL</span>
                  <h3>Where users drop off</h3>
                </div>

                <div className="funnel-legend">
                  <span>Variant A</span>
                  <span>Variant B</span>
                </div>
              </div>

              <div className="funnel-grid">
                <div className="funnel-stage">
                  <span>Visitors</span>

                  <div className="funnel-values">
                    <strong>{result.usersA.toLocaleString()}</strong>
                    <strong>{result.usersB.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="funnel-stage">
                  <span>Product Views</span>

                  <div className="funnel-values">
                    <div>
                      <strong>{result.productViewsA.toLocaleString()}</strong>
                      <small>{result.viewRateA.toFixed(1)}% of visitors</small>
                    </div>

                    <div>
                      <strong>{result.productViewsB.toLocaleString()}</strong>
                      <small>{result.viewRateB.toFixed(1)}% of visitors</small>
                    </div>
                  </div>
                </div>

                <div className="funnel-stage">
                  <span>Add to Bag</span>
                  <div className="funnel-values">
                    <div>
                      <strong>{result.addToBagA.toLocaleString()}</strong>
                      <small>{result.addToBagRateA.toFixed(1)}% of views</small>
                    </div>

                    <div>
                      <strong>{result.addToBagB.toLocaleString()}</strong>
                      <small>{result.addToBagRateB.toFixed(1)}% of views</small>
                    </div>
                  </div>
                </div>

                <div className="funnel-stage">
                  <span>Checkout</span>

                  <div className="funnel-values">
                    <div>
                      <strong>{result.checkoutA.toLocaleString()}</strong>
                      <small>{result.checkoutRateA.toFixed(1)}% of add-to-bag</small>
                    </div>

                    <div>
                      <strong>{result.checkoutB.toLocaleString()}</strong>
                      <small>{result.checkoutRateB.toFixed(1)}% of add-to-bag</small>
                    </div>
                  </div>
                </div>

                <div className="funnel-stage">
                  <span>Purchase</span>

                  <div className="funnel-values">
                    <div>
                      <strong>{result.ordersA.toLocaleString()}</strong>
                      <small>{result.purchaseRateA.toFixed(1)}% of checkout</small>
                    </div>

                    <div>
                      <strong>{result.ordersB.toLocaleString()}</strong>
                      <small>{result.purchaseRateB.toFixed(1)}% of checkout</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="recommendation">
              <span>STATISTICAL ANALYSIS</span>

              <h3>
                {result.statisticallySignificant
                  ? '✓ Statistically Significant'
                  : '⚠ Not Statistically Significant'}
              </h3>

              <p>
                p-value: <strong>{result.pValue.toFixed(4)}</strong>
              </p>

              <p>
                {result.statisticallySignificant
                  ? 'The observed difference is statistically significant at the 95% confidence level.'
                  : 'The observed difference is not statistically significant at the 95% confidence level. Continue collecting data.'}
              </p>

              <div className="confidence-intervals">
                <h4>95% Confidence Intervals</h4>

                <div className="confidence-grid">
                  <div className="confidence-card">
                    <span>Variant A</span>
                    <strong>
                      {result.confidenceIntervalA.lower.toFixed(2)}%
                      {' – '}
                      {result.confidenceIntervalA.upper.toFixed(2)}%
                    </strong>
                    <small>
                      Estimated conversion range
                    </small>
                  </div>

                  <div className="confidence-card">
                    <span>Variant B</span>
                    <strong>
                      {result.confidenceIntervalB.lower.toFixed(2)}%
                      {' – '}
                      {result.confidenceIntervalB.upper.toFixed(2)}%
                    </strong>
                    <small>
                      Estimated conversion range
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="history">
              <div className="history-header">
                <div>
                  <span className="badge">EXPERIMENT HISTORY</span>
                  <h3>Previous experiment runs</h3>
                </div>

                <span className="history-count">
                  {experimentHistory.length} run
                  {experimentHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="history-table">
                <div className="history-row history-heading">
                  <span>Date</span>
                  <span>Winner</span>
                  <span>Conversion</span>
                  <span>Uplift</span>
                  <span>p-value</span>
                  <span>Decision</span>
                </div>

                {experimentHistory
                  .slice()
                  .reverse()
                  .map((experiment) => (
                    <div className="history-row" key={experiment.id}>
                      <span>{experiment.date}</span>

                      <span>{experiment.winner}</span>

                      <span>
                        {experiment.conversionA.toFixed(2)}% →{' '}
                        {experiment.conversionB.toFixed(2)}%
                      </span>

                      <span>
                        {experiment.uplift >= 0 ? '+' : ''}
                        {experiment.uplift.toFixed(1)}%
                      </span>

                      <span>
                        {experiment.pValue.toFixed(4)}
                      </span>

                      <span>{experiment.pmDecision}</span>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
    </>
  )
}

export default App