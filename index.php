<?php
/**
 * PHP entrypoint voor Hostinger (herkent project als PHP-app).
 * Serveert de salon-app (index.html).
 */
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
