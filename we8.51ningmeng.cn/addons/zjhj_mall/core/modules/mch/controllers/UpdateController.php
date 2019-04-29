<?php

/**
 * Created by IntelliJ IDEA.
 * User: luwei
 * Date: 2017/8/3
 * Time: 14:36
 * Version: 1.5.2
 */

namespace app\modules\mch\controllers;

use Comodojo\Zip\Zip;
use Curl\Curl;

class UpdateController extends Controller
{
    //private $api_root = 'http://localhost/php/cloud_zjhejiang/web/api/mall';
    //private $api_root = 'http://cloud.zjhejiang.com/api/mall';
	private $api_root = 'http://hjupdate.yixiuba.net/update.php';

    public function actionIndex()
    {
        $this->checkIsAdmin();
        $api = $this->api_root . '?a=check&v='.hj_core_version();
        $curl = new Curl();
		//var_dump(base64_decode($this->getSiteData()));
		//exit();
        //var_dump($api);
		//exit();
		
		
		//$curl->get($api, [
        //   'data' => $this->getSiteData(),
        //]);
        //$res = json_decode($curl->response, true);
		$res = file_get_contents($api);
	
		$res = json_decode($res,true);
		
        if (!$res) {
            return $this->render('error', [
                'msg' => '云服务器连接失败，请检查您的服务器与云服务器的连接是否正常',
                'curl' => $curl,
                'error_code' => $curl->error_code,
            ]);
        }
		
		/*
	array(3) { 
	["code"]=> int(1) 
	["msg"]=> string(44) "&#35828;&#38;&#22270;&#38;&#35889;&#38;&#28304;&#38;&#30721;&#25552;&#42;&#37266;" 
	["data"]=> array(0) { } 
	}	
	
		*/
		//var_dump($res);
		
        if ($res['code'] == 1) {
            return $this->render('error', [
                'msg' => $res['msg'],
                'curl' => $curl,
                'error_code' => $curl->error_code,
            ]);
        } else {
            return $this->render('index', [
                'version' => hj_core_version(),
                'res' => $res,
                'version_list' => [],
            ]);
        }
		
		/*
		array(3) { 
		["code"]=> int(0) 
		["data"]=> array(3) { 
		["current_version"]=> string(5) "2.4.5" 
		["next_version"]=> NULL 
		["version_list"]=> array(102) 
		{ [0]=> array(3) { ["version"]=> string(5) "1.4.0" ["desc"]=> string(539) "
		*/
    }

    public function actionUpdate()
    {
        $this->checkIsAdmin();
        if (\Yii::$app->request->isPost) {
            $api = "http://hjupdate.yixiuba.net/update.php?c=Index&a=update";
			
            $target_version = \Yii::$app->request->post('target_version');
			$api = $api .'&target_version='.$target_version;
            /*string(7) "2.4.9.1"*/
			
			$curl = new Curl();
			//$data = base64_decode($this->getSiteData());
			
           /* $curl->get($api, [
                'data' => $this->getSiteData(),
                'target_version' => $target_version,
            ]);*/
			$res = file_get_contents($api);
            $res = json_decode($res, true);
			
			
			/*
			array(3) { 
			["code"]=> int(0) 
			["data"]=> array(2) { 
			["src_file"]=> string(79) "http://cloud.zjhejiang.com/uploads/file/19/1966ba0edaf7d61d2fbc6eea78a5463e.zip" 
			["db_file"]=> string(79) "http://cloud.zjhejiang.com/uploads/file/de/deb6bb58fac73298b7fda4bf889c6196.sql" } 
			["msg"]=> string(0) "" }
			*/
            if (!$res) {
                return [
                    'code' => 1,
                    'msg' => '更新失败，与云服务器连接失败',
                ];
            }

            if ($res['code'] != 0) {
                return $res;
            }

            $temp_dir = \Yii::$app->basePath . "/temp/update/version/{$target_version}";
            $this->mkdir($temp_dir);
            $src_file = "{$temp_dir}/src.zip";
            $db_file = "{$temp_dir}/db.sql";

            $curl->get($res['data']['src_file']);
            if (!$curl->error) {
                file_put_contents($src_file, $curl->response);
            } else {
                return [
                    'code' => 1,
                    'msg' => '更新失败，更新文件src.zip下载失败',
                ];
            }

            $curl->get($res['data']['db_file']);
            if (!$curl->error) {
                file_put_contents($db_file, $curl->response);
            } else {
                return [
                    'code' => 1,
                    'msg' => '更新失败，更新文件db.sql下载失败',
                ];
            }
            $t = \Yii::$app->db->beginTransaction();
            try {
                $sql = file_get_contents($db_file);
                $sql = str_replace('hjmall_', \Yii::$app->db->tablePrefix, $sql);
                \Yii::$app->db->createCommand($sql)->execute();
                $zip = Zip::open($src_file);
                $zip->extract(\Yii::$app->basePath);
                $zip->close();
                $t->commit();
                unlink($src_file);
                unlink($db_file);
                return [
                    'code' => 0,
                    'msg' => '版本更新成功，已更新至v' . $target_version,
                ];
            } catch (\Exception $e) {
                $t->rollBack();
                return [
                    'code' => 1,
                    'msg' => '更新失败：' . $e->getMessage(),
                ];
            }
        }
    }

    private function getSiteData()
    {
        $data = base64_encode(json_encode((object)[
            'host' => \Yii::$app->request->hostName,
            'from_url' => \Yii::$app->request->absoluteUrl,
            'current_version' => hj_core_version(),
        ]));
        return $data;
    }

    private function mkdir($dir)
    {
        if (!is_dir($dir)) {
            if (!$this->mkdir(dirname($dir))) {
                return false;
            }
            if (!mkdir($dir)) {
                return false;
            }
        }
        return true;
    }

}
