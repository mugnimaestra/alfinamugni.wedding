# Network Simulation Testing Guide

## Overview
This guide covers testing the enhanced photo upload system under various Indonesian network conditions.

---

## Test Scenarios

### 1. 4G Network (High Speed)
**Expected**: 50 Mbps, High quality compression (0.85)

**Chrome DevTools Setup**:
1. Open DevTools (F12)
2. Network tab → Throttling → Add custom profile
3. Settings:
   - Download: 50,000 Kbps
   - Upload: 20,000 Kbps
   - Latency: 20 ms

**Expected Results**:
- ✅ Quality: 0.8-0.85 (High)
- ✅ Max dimensions: 1920x1440
- ✅ Upload time: Fast (< 5 seconds for 5MB image)
- ✅ Compression ratio: 3-5x

---

### 2. 3G Network (Medium Speed)
**Expected**: 5 Mbps, Medium quality compression (0.75)

**Chrome DevTools Setup**:
1. Network tab → Throttling → Custom
2. Settings:
   - Download: 5,000 Kbps
   - Upload: 1,500 Kbps
   - Latency: 100 ms

**Expected Results**:
- ✅ Quality: 0.6-0.7 (Medium)
- ✅ Max dimensions: 1200x900
- ✅ Upload time: Moderate (10-20 seconds for 5MB image)
- ✅ Compression ratio: 5-8x

---

### 3. 2G Network (Low Speed)
**Expected**: 0.5 Mbps, Low quality compression (0.60)

**Chrome DevTools Setup**:
1. Network tab → Throttling → Slow 3G or Custom
2. Settings:
   - Download: 500 Kbps
   - Upload: 250 Kbps
   - Latency: 300 ms

**Expected Results**:
- ✅ Quality: 0.4-0.5 (Low)
- ✅ Max dimensions: 800x600
- ✅ Upload time: Slow (30+ seconds for 5MB image)
- ✅ Compression ratio: 10-15x
- ✅ Target size: ~200KB

---

### 4. Peak Hours Simulation
**Expected**: Reduced quality during peak times

**Test Steps**:
1. Set system time to 7:00-9:00 AM Jakarta (WIB)
2. Upload photos at 8:00 AM
3. Set system time to 6:00-8:00 PM Jakarta
4. Upload photos at 7:00 PM

**Expected Results**:
- ✅ Quality multiplier: 0.8x reduction
- ✅ Network indicator shows "🔴 Peak Hours"
- ✅ Compression more aggressive than normal hours

---

## Carrier-Specific Testing

### Telkomsel (Premium Carrier)
**Test Method**: Use VPN or mobile hotspot

**Expected**:
- ✅ Detected as "Telkomsel"
- ✅ Coverage: Excellent
- ✅ Speed: 32.5 Mbps average
- ✅ Network type: 4G

### XL Axiata
**Expected**:
- ✅ Detected as "XL Axiata"
- ✅ Coverage: Good
- ✅ Speed: 25.3 Mbps average

### Indosat
**Expected**:
- ✅ Detected as "Indosat Ooredoo Hutchison"
- ✅ Coverage: Good
- ✅ Speed: 28.7 Mbps average

---

## Device Testing

### Low-End Devices
**Target**: Samsung A10, Xiaomi Redmi 8, Oppo A3s

**Simulation**:
- Chrome DevTools → Performance → CPU 4x slowdown
- Memory limit simulation

**Expected**:
- ✅ Memory-optimized compression enabled
- ✅ Processing delay between files (200ms)
- ✅ Lower smoothing quality
- ✅ No crashes or freezes

### High-End Devices
**Target**: iPhone 12+, Samsung S21+

**Expected**:
- ✅ High smoothing quality
- ✅ Parallel processing
- ✅ WebP format preferred
- ✅ Fast compression

---

## Compression Targets Verification

### Test Images
Use these test images:
1. **High-res photo** (5000x3000, 8MB)
2. **Medium photo** (3000x2000, 3MB)
3. **Small photo** (1500x1000, 500KB)

### Expected Results

#### 4G Network
| Original Size | Target Size | Max Dimensions |
|--------------|-------------|----------------|
| 8MB          | ~800KB      | 1920x1440     |
| 3MB          | ~600KB      | 1920x1440     |
| 500KB        | ~400KB      | 1500x1000     |

#### 3G Network
| Original Size | Target Size | Max Dimensions |
|--------------|-------------|----------------|
| 8MB          | ~500KB      | 1200x900      |
| 3MB          | ~400KB      | 1200x900      |
| 500KB        | ~300KB      | 1200x900      |

#### 2G Network
| Original Size | Target Size | Max Dimensions |
|--------------|-------------|----------------|
| 8MB          | ~200KB      | 800x600       |
| 3MB          | ~200KB      | 800x600       |
| 500KB        | ~150KB      | 800x600       |

---

## Automated Testing Script

```bash
#!/bin/bash
# Run this script to test various network conditions

echo "Testing 4G network..."
# Add lighthouse test with 4G throttling

echo "Testing 3G network..."
# Add lighthouse test with 3G throttling

echo "Testing 2G network..."
# Add lighthouse test with 2G throttling

echo "Results saved to test-results/"
```

---

## Performance Benchmarks

### Success Criteria
- ✅ 4G upload < 5 seconds per 5MB image
- ✅ 3G upload < 20 seconds per 5MB image
- ✅ 2G upload < 60 seconds per 5MB image
- ✅ Compression ratio > 3x for all networks
- ✅ No memory leaks after 50+ uploads
- ✅ Thumbnail generation < 1 second
- ✅ Batch upload of 10 images completes without errors

### Metrics to Track
1. Original file size
2. Compressed file size
3. Compression ratio
4. Processing time
5. Upload time
6. Total time (processing + upload)
7. Memory usage
8. Network bytes sent
9. Retry attempts
10. Success rate

---

## Browser Compatibility

### Desktop Browsers
- ✅ Chrome 90+ (Full support)
- ✅ Firefox 88+ (Full support)
- ✅ Safari 14+ (WebP fallback to JPEG)
- ✅ Edge 90+ (Full support)

### Mobile Browsers
- ✅ Chrome Android (Full support)
- ✅ Safari iOS 14+ (WebP fallback)
- ✅ Samsung Internet (Full support)
- ✅ Firefox Android (Full support)

---

## Known Issues & Limitations

### WebP Support
- Safari < 14: Fallback to JPEG
- Solution: Automatic format detection and fallback

### Battery API
- Not supported on Firefox
- Solution: Optional enhancement, graceful degradation

### Camera Capture
- Requires HTTPS or localhost
- Solution: Dev environment uses localhost, production uses HTTPS

### HEIC/HEIF Format
- Limited browser support
- Solution: Server-side conversion or user prompt to export as JPEG

---

## Troubleshooting

### Issue: Photos not compressing
**Solution**: Check browser console for errors, verify network-utils.ts loaded

### Issue: Upload fails repeatedly
**Solution**: Check retry logic, verify R2 bucket permissions

### Issue: Thumbnails not generating
**Solution**: Verify canvas API support, check file type

### Issue: Network info shows "Unknown"
**Solution**: Navigator Connection API not supported, using defaults

---

## Continuous Monitoring

### Production Metrics to Track
1. Average compression ratio by network type
2. Upload success rate
3. Most common device types
4. Peak usage hours
5. Average file sizes (original vs compressed)
6. Popular carriers
7. Error rates by network type

### Cloudflare Analytics
Use Cloudflare Analytics to monitor:
- R2 bucket usage
- D1 database queries
- API response times
- Geographic distribution of uploads

