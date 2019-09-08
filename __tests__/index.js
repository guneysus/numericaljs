import test from "ava";

function PMT(ir, np, pv, fv, type) {
  /*
      from: https://stackoverflow.com/a/22385930/1766716
  
       * ir   - interest rate per month
       * np   - number of periods (months)
       * pv   - present value
       * fv   - future value
       * type - when the payments are due:
       *        0: end of the period, e.g. end of month (default)
       *        1: beginning of period
       */
  var pmt, pvif;

  fv || (fv = 0);
  type || (type = 0);

  if (ir === 0) return -(pv + fv) / np;

  pvif = Math.pow(1 + ir, np);
  pmt = (-ir * pv * (pvif + fv)) / (pvif - 1);

  if (type === 1) pmt /= 1 + ir;

  return pmt;
}

function Payoff(ir, np, pv, fv, type) {
  return np * PMT(ir, np, pv, fv, type);
}

function log(i, c, fc, err, n = 2) {
  console.log(`#${i}`, c.toFixed(n), fc.toFixed(n));
}

test("bisection method", t => {
  let ir = 0.019;
  let np = 6;
  let payoff = -799;

  let a = -1000;
  let b = 1000;
  let c0 = 0;
  let c = (a + b) / 2;
  let eps = 1e-7;

  for (let i = 1; i < 100; i++) {
    let err = Math.abs(1.0 - c0 / c);
    c0 = c;

    c = (b + a) / 2.0;

    const fa = Payoff(ir, np, a);
    const fb = Payoff(ir, np, b);
    const fc = Payoff(ir, np, c);

    log(i, c, fc, err, 5);
    
    if ((payoff > fa && payoff < fc) || (payoff < fa && payoff > fc)) {
      b = c;
    } else {
      a = c;
    }

    if( err <= eps) {
        break;
    }

    t.pass();
  }
});
