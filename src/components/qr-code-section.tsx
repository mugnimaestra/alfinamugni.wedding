import { component$, $ } from "@builder.io/qwik";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { LuShare2, LuDownload } from "@qwikest/icons/lucide";

export const QrCodeSection = component$(() => {
  const galleryUrl = typeof window !== 'undefined' ? window.location.origin + '/gallery' : '/gallery';
  
  const handleShare = $(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wedding Gallery - Alfina & Mugni',
          text: 'Check out our wedding gallery and share your moments!',
          url: galleryUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(galleryUrl);
      alert('Gallery link copied to clipboard!');
    }
  });

  const handleDownload = $(() => {
    // In a real implementation, this would generate and download a QR code
    alert('QR code download feature would be implemented here');
  });

  return (
    <section class="bg-gradient-to-b from-wedding-cream/40 to-white px-4 py-16">
      <div class="mx-auto max-w-4xl">
        <div class="text-center mb-12">
          <h2 class="font-serif text-3xl font-light text-wedding-brown md:text-5xl mb-4">
            Share Your Moments
          </h2>
          <p class="text-lg text-wedding-text-muted max-w-2xl mx-auto">
            Scan the QR code or share the link to access our wedding gallery and upload your favorite photos and videos.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 items-center">
          {/* QR Code */}
          <div class="flex justify-center">
            <Card class="p-8 bg-white shadow-lg">
              <div class="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div class="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span class="text-xs text-gray-600 text-center">QR Code</span>
                </div>
              </div>
              <p class="text-sm text-center text-gray-600">
                Scan to open wedding gallery
              </p>
            </Card>
          </div>

          {/* Actions */}
          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold text-wedding-brown mb-2">
                Gallery Link
              </h3>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-700 break-all font-mono">
                  {galleryUrl}
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <Button
                onClick$={handleShare}
                class="w-full bg-wedding-brown hover:bg-wedding-brown/90 text-white"
              >
                <LuShare2 class="w-4 h-4 mr-2" />
                Share Gallery Link
              </Button>
              
              <Button
                onClick$={handleDownload}
                variant="outline"
                class="w-full"
              >
                <LuDownload class="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>

            <div class="bg-wedding-cream/50 p-4 rounded-lg">
              <h4 class="font-semibold text-wedding-brown mb-2">How to contribute:</h4>
              <ul class="text-sm text-wedding-text-muted space-y-1">
                <li>• Scan the QR code or visit the gallery link</li>
                <li>• Click "Upload Photos/Videos" button</li>
                <li>• Select your favorite moments</li>
                <li>• Add your name and a description</li>
                <li>• Submit for approval</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-12 text-center">
          <p class="text-sm text-wedding-text-muted">
            All uploaded content will be reviewed before appearing in the public gallery.
            Help us create beautiful memories together! 💕
          </p>
        </div>
      </div>
    </section>
  );
});