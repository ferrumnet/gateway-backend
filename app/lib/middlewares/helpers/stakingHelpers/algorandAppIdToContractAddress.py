import sys
import algosdk.encoding as e
def main():
    a = e.encode_address(e.checksum(b'appID'+(int(sys.argv[1])).to_bytes(8, 'big')))
    print(a)
    

if __name__ == '__main__':
    main()  
# x = e.encode_address(e.checksum(b'appID'+(sys.argv[1]).to_bytes(8, 'big')))