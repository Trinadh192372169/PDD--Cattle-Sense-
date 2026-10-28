import traceback
try:
    import breed_services
    b = breed_services.generate_tts_audio("సిరి పశువు భారతదేశంలోని ఒక దేశవాళీ జాతి.", "te")
    print("Telugu TTS SUCCESS, bytes:", len(b))
except Exception as e:
    traceback.print_exc()
