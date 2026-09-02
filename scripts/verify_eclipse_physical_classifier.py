#!/usr/bin/env python3
"""Independent oracle for MathAstro's physical eclipse-membership rule.

Production uses @swisseph/browser >=1.3.1. This regression uses PySwissEph only as
an independent reference: exact new/full-moon roots must lie inside the physical
contact interval iff that syzygy is an eclipse. No nodal-orb heuristic decides it.
"""
from __future__ import annotations
import math
import swisseph as swe

FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED

def wrap180(x: float) -> float:
    return (x + 180.0) % 360.0 - 180.0

def phase_error(jd: float, target: float) -> float:
    sun = swe.calc_ut(jd, swe.SUN, FLAGS)[0][0]
    moon = swe.calc_ut(jd, swe.MOON, FLAGS)[0][0]
    return wrap180((moon - sun) - target)

def bisect_root(a: float, b: float, target: float) -> float:
    fa = phase_error(a, target)
    for _ in range(100):
        m = (a+b)/2
        fm = phase_error(m, target)
        if abs(fm) < 1e-10 or b-a < 1e-9:
            return m
        if fa * fm <= 0:
            b = m
        else:
            a, fa = m, fm
    return (a+b)/2

def nearest_syzygy(jd: float, target: float) -> float:
    step=.1
    start=jd-2
    prev_t=start
    prev=phase_error(prev_t,target)
    for i in range(1, 400):
        t=start+i*step
        cur=phase_error(t,target)
        if abs(cur-prev)<90 and prev*cur<=0:
            return bisect_root(prev_t,t,target)
        prev_t,prev=t,cur
    raise RuntimeError('syzygy not found')

def solar_membership(root: float):
    flag,tret=swe.sol_eclipse_when_glob(root-1, swe.FLG_SWIEPH, 0, False)
    begin,end=tret[2],tret[3]
    return begin <= root <= end, flag, tret[0], begin, end

def lunar_membership(root: float):
    flag,tret=swe.lun_eclipse_when(root-1, swe.FLG_SWIEPH, 0, False)
    begin,end=tret[6],tret[7]
    return begin <= root <= end, flag, tret[0], begin, end

# Known 2001 solar eclipse: locate the exact new moon around the eclipse maximum.
solar_event = swe.sol_eclipse_when_glob(swe.julday(2001,6,1), swe.FLG_SWIEPH, 0, False)
solar_root = nearest_syzygy(solar_event[1][0], 0)
solar_ok, solar_flag, solar_max, solar_begin, solar_end = solar_membership(solar_root)
assert solar_ok, (solar_root, solar_begin, solar_end)

# Known 2001 lunar eclipse after June 2001: exact full moon must sit in penumbral interval.
lunar_event = swe.lun_eclipse_when(swe.julday(2001,6,1), swe.FLG_SWIEPH, 0, False)
lunar_root = nearest_syzygy(lunar_event[1][0], 180)
lunar_ok, lunar_flag, lunar_max, lunar_begin, lunar_end = lunar_membership(lunar_root)
assert lunar_ok, (lunar_root, lunar_begin, lunar_end)

# Ordinary lunation around Barra Mansa birth: nearest pre-birth syzygy is not an eclipse.
birth=swe.julday(2001,4,21,9.75)
ordinary_root=nearest_syzygy(birth-15, 180)  # full moon in the April neighbourhood
ordinary_ok,*_=lunar_membership(ordinary_root)
assert not ordinary_ok, ordinary_root

print('PASS physical eclipse classifier oracle')
print(f'solar: root={solar_root:.8f} max={solar_max:.8f} interval=[{solar_begin:.8f},{solar_end:.8f}] flag={solar_flag}')
print(f'lunar: root={lunar_root:.8f} max={lunar_max:.8f} interval=[{lunar_begin:.8f},{lunar_end:.8f}] flag={lunar_flag}')
print(f'ordinary full moon: root={ordinary_root:.8f} eclipse=False')
