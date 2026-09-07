import favicon16 from "../favicon/favicon-16x16.png";
import favicon32 from "../favicon/favicon-32x32.png";
import appleTouchIcon from "../favicon/apple-touch-icon.png";
import android192 from "../favicon/android-chrome-192x192.png";
import android512 from "../favicon/android-chrome-512x512.png";

function addIcon(rel, href, sizes, type = "image/png") {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    link.type = type;
    if (sizes) link.sizes = sizes;
    document.head.appendChild(link);
}

addIcon("icon", favicon16, "16x16");
addIcon("icon", favicon32, "32x32");
addIcon("apple-touch-icon", appleTouchIcon, "180x180");
addIcon("icon", android192, "192x192");
addIcon("icon", android512, "512x512");
