#!/bin/sh
set -e
# Entrypoint for AI Upscale image
#
# Same as base entrypoint, plus:
# - Auto-builds TensorRT engines on first start if missing

# Fix cache directory ownership
mkdir -p /app/cache
if [ "$(stat -c '%U' /app/cache)" != "tolochatv" ]; then
    chown -R tolochatv:tolochatv /app/cache 2>/dev/null || true
fi
# Ensure writable even on filesystems that ignore chown (e.g., some NAS mounts)
if ! gosu tolochatv sh -c "touch /app/cache/.perm_test && rm /app/cache/.perm_test" 2>/dev/null; then
    chmod -R u+rwX,g+rwX /app/cache 2>/dev/null || true
    chmod g+s /app/cache 2>/dev/null || true
fi
# Final verification - warn if still not writable
if ! gosu tolochatv sh -c "touch /app/cache/.perm_test && rm /app/cache/.perm_test" 2>/dev/null; then
    echo "WARNING: /app/cache is not writable by tolochatv user"
    echo "Cache operations may fail. Check volume permissions."
fi

# Fix models directory ownership
mkdir -p /models
if [ "$(stat -c '%U' /models)" != "tolochatv" ]; then
    chown -R tolochatv:tolochatv /models 2>/dev/null || true
fi
if ! gosu tolochatv sh -c "touch /models/.perm_test && rm /models/.perm_test" 2>/dev/null; then
    chmod -R u+rwX,g+rwX /models 2>/dev/null || true
fi
if ! gosu tolochatv sh -c "touch /models/.perm_test && rm /models/.perm_test" 2>/dev/null; then
    echo "WARNING: /models is not writable by tolochatv user"
    echo "TensorRT engine caching may fail. Check volume permissions."
fi

# Add tolochatv user to render device group (for VAAPI hardware encoding)
if [ -e /dev/dri/renderD128 ]; then
    RENDER_GID=$(stat -c '%g' /dev/dri/renderD128)
    RENDER_ADDED=false
    if groupadd --gid "$RENDER_GID" hostrender 2>/dev/null; then
        :  # Created new group
    fi
    if usermod -aG hostrender tolochatv 2>/dev/null; then
        RENDER_ADDED=true
    fi
    if [ "$RENDER_ADDED" = "false" ]; then
        echo "WARNING: Could not add tolochatv to render group (GID $RENDER_GID)"
        if [ "$RENDER_GID" = "65534" ]; then
            echo "  GID 65534 (nogroup) indicates Docker user namespace mapping issue."
            echo "  This is usually harmless - VAAPI may still work if container has device access."
            echo "  To fix: ensure 'render' group exists on host and user is in it, or use --privileged"
        else
            echo "  VAAPI hardware encoding may not be available."
            echo "  To fix on host: sudo usermod -aG render \$USER (then restart Docker)"
        fi
    fi
fi

# Build TensorRT engines if missing (first run only)
# Builds both recommended models: 4x-compact (quality) and 2x-liveaction-span (fast)
if ! ls /models/4x-compact_*p_fp16.engine >/dev/null 2>&1; then
    echo "========================================"
    echo "AI Upscale: First start detected"
    echo "========================================"
    echo "Building TensorRT engines for your GPU..."
    echo "Models: 4x-compact (quality), 2x-liveaction-span (fast)"
    echo "This only happens once (cached in /models volume)."
    echo ""
    # Run as tolochatv user so files have correct ownership
    if ! gosu tolochatv env MODEL_DIR=/models MODEL="recommended" /app/tools/install-ai_upscale.sh; then
        echo "ERROR: Failed to build TensorRT engines"
        echo "Check GPU compatibility and CUDA installation"
        exit 1
    fi

    # Verify engines were created
    if ! ls /models/4x-compact_*p_fp16.engine >/dev/null 2>&1; then
        echo "ERROR: TensorRT engines not found after build"
        echo "Build may have succeeded but produced no output"
        exit 1
    fi
fi

# Drop to tolochatv user and run the app
exec gosu tolochatv python3 main.py --port "${TOLOCHATV_PORT:-8000}" ${TOLOCHATV_HTTPS:+--https}
