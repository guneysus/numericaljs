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

function PV(ir, np, paymentAmount, xa, xb, eps = 1e-8, maxIter = 100, fv = 0) {
  let c0 = 0;
  let c = (xa + xb) / 2;

  for (let i = 1; i <= maxIter; i++) {
    let err = Math.abs(1.0 - c0 / c);

    if (err <= eps) {
      return c;
    }

    c0 = c;

    c = (xb + xa) / 2.0;

    const fa = PMT(ir, np, xa);
    const fc = PMT(ir, np, c);

    log(i, c, fc, err, 5);

    if (
      (paymentAmount > fa && paymentAmount < fc) ||
      (paymentAmount < fa && paymentAmount > fc)
    ) {
      xb = c;
    } else {
      xa = c;
    }
  }
}

function log(i, c, fc, err, n = 2) {
  console.log(`#${i}`, c.toFixed(n), fc.toFixed(n), err.toFixed(n));
}

function solveBisect(fx, x0, x1, eps, maxIter) {
  let xn = (x0 + x1) / 2;
  let err = 1.0;

  for (let i = 1; i <= maxIter; i++) {

    if (err <= eps) {
      return xn;
    }
    err = Math.abs(1.0 - (x0 / x1));

    xn = (x1 + x0) / 2.0;

    const fx0 = fx(x0);
    const fxn = fx(xn);

    log(i, xn, fxn, err, 5);

    if (
      (0.0 > fx0 && 0.0 < fxn) ||
      (0.0 < fx0 && 0.0 > fxn)
    ) {
      x1 = xn;
    } else {
      x0 = xn;
    }
  }
}

test("bisection method", t => {
  let ir = 0.0199 * 1.2;
  console.log(ir);

  let np = 6;
  let payoff = 799;
  var paymentAmount = payoff / np;

  var fx = function(x) {
    return paymentAmount - PMT(ir, np, x);
  };

  var sqrtX = function(x) {
    return 2 - Math.pow(x, 2);
  }

  // let pv = solveBisect(fx, - payoff, payoff, 1e-8, 100);
  let squareRootOfTwo = solveBisect(sqrtX, 0, 2, 1e-10, 100);

  console.log(squareRootOfTwo);

  t.pass();
});
